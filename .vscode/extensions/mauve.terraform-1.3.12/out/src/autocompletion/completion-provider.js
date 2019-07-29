"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const vscode = require("vscode");
const helpers_1 = require("../helpers");
const ast_1 = require("../index/ast");
const hcl_hil_1 = require("../index/hcl-hil");
const logger_1 = require("../logger");
const telemetry_1 = require("../telemetry");
const builtin_functions_1 = require("./builtin-functions");
const model_1 = require("./model");
const section_completions_1 = require("./section-completions");
const resourceExp = new RegExp("(resource|data)\\s+(\")?(\\w+)(\")?\\s+(\")?([\\w\\-]+)(\")?\\s+({)");
const terraformExp = new RegExp("(variable|output|module)\\s+(\")?([\\w\\-]+)(\")?\\s+({)");
const nestedRegexes = [/\w[A-Za-z0-9\-_]*(\s*){/, /\w[A-Za-z0-9\-_]*(\s*)=(\s*){/];
const propertyExp = new RegExp("^([\\w_-]+)$");
class CompletionProvider {
    constructor(index) {
        this.index = index;
        this.logger = new logger_1.Logger("completion-provider");
    }
    sectionToCompletionItem(section, needInterpolation, range) {
        let item = new vscode.CompletionItem(section.id());
        switch (section.sectionType) {
            case "variable":
                item.kind = vscode.CompletionItemKind.Variable;
                break;
            case "data":
                item.kind = vscode.CompletionItemKind.Struct;
                break;
            case "resource":
                item.kind = vscode.CompletionItemKind.Class;
                break;
            case "output":
                item.kind = vscode.CompletionItemKind.Value;
                break;
        }
        if (needInterpolation) {
            item.insertText = '${' + item.label + '}';
        }
        if (range) {
            item.range = range;
        }
        // sort sections before functions
        item.sortText = `000-${section.id()}`;
        return item;
    }
    knownFunctionToCompletionItem(fd, needInterpolation, range) {
        let prototype = fd.name + '(' + fd.parameters.join(", ") + ')';
        let item = new vscode.CompletionItem(prototype);
        item.kind = vscode.CompletionItemKind.Function;
        let snippet = new vscode.SnippetString();
        if (needInterpolation) {
            snippet.appendText('${');
        }
        snippet.appendText(fd.name);
        snippet.appendText('(');
        fd.parameters.forEach((parameter, index, array) => {
            snippet.appendPlaceholder(parameter);
            if (index !== array.length - 1)
                snippet.appendText(', ');
        });
        snippet.appendText(')');
        if (needInterpolation) {
            snippet.appendText('}');
        }
        item.insertText = snippet;
        if (range) {
            item.range = range;
        }
        // sort functions after functions
        item.sortText = `001-${fd.name}`;
        item.filterText = fd.name;
        return item;
    }
    interpolationCompletions(document, position) {
        let beforeRange = new vscode.Range(new vscode.Position(position.line, 0), position);
        let before = document.getText(beforeRange);
        let start = before.lastIndexOf("${");
        let needInterpolation = false; // do we need to insert ${ aswell?
        let interpolation = "";
        if (start === -1) {
            if (before[before.length - 1] === '"') {
                needInterpolation = true;
                interpolation = "";
            }
            else {
                return [];
            }
        }
        else {
            // everything except ${
            interpolation = before.substring(start + 2);
        }
        // we are inside a string interpolation
        let filterStartPos = helpers_1.backwardsSearch(interpolation, (ch) => '({[ -+/]})'.indexOf(ch) !== -1);
        if (filterStartPos === -1)
            filterStartPos = 0; // use entire string after ${ as filter
        else
            filterStartPos += 1; // do not include matching character
        let [file, group] = this.index.indexDocument(document);
        if (!file || !group)
            return [];
        let filter = interpolation.substring(filterStartPos).trim();
        if (filter.length === 0) {
            return group.query("ALL_FILES", { unique: true }).map((s) => {
                return this.sectionToCompletionItem(s, needInterpolation);
            }).concat(...builtin_functions_1.GetKnownFunctions().map((f) => this.knownFunctionToCompletionItem(f, needInterpolation)));
        }
        const wordRangeAtPos = document.getWordRangeAtPosition(position);
        let replaceRange = new vscode.Range(position.translate(0, -filter.length), wordRangeAtPos ? document.getWordRangeAtPosition(position).end : position);
        return group.query("ALL_FILES", { id: { type: "PREFIX", match: filter }, unique: true }).map((s) => {
            return this.sectionToCompletionItem(s, needInterpolation, replaceRange);
        }).concat(...builtin_functions_1.GetKnownFunctions().filter(f => f.name.indexOf(filter) === 0).map((f) => this.knownFunctionToCompletionItem(f, needInterpolation, replaceRange)));
    }
    provideCompletionItems(document, position) {
        try {
            // figure out if we are inside a string
            const [ast, error] = hcl_hil_1.parseHcl(document.getText());
            if (ast) {
                let offset1 = document.offsetAt(position);
                let pos = {
                    Line: position.line + 1,
                    Column: position.character + 1,
                    Offset: 0,
                    Filename: ''
                };
                let token = ast_1.getTokenAtPosition(ast, pos);
                if (token) {
                    let interpolationCompletions = this.interpolationCompletions(document, position);
                    if (interpolationCompletions.length !== 0)
                        return interpolationCompletions;
                }
            }
            // TODO: refactor to use ast here aswell
            let lineText = document.lineAt(position.line).text;
            let lineTillCurrentPosition = lineText.substr(0, position.character);
            // high-level types ex: variable, resource, module, output etc..
            if (position.character === 0 || this.isTerraformTypes(lineText)) {
                return this.getFilteredTerraformTypes(lineText);
            }
            // resource | data "resource type auto completion"
            let possibleResources = this.lookupForTerraformResource(lineTillCurrentPosition);
            if (possibleResources.length > 0) {
                return this.getAutoCompletion(possibleResources, vscode.CompletionItemKind.Class);
            }
            // auto-completion for property types including 1 level deeep nested types
            if (lineTillCurrentPosition.trim().length === 0 || propertyExp.test(lineTillCurrentPosition.trim())) {
                let prev = position.line - 1;
                let nestedTypes = [];
                let parentResource = "";
                let parentType = "";
                let nestedCounts = 0;
                while (prev >= 0) {
                    let line = document.lineAt(prev).text;
                    // nested closing block
                    if (line.trim() === "}") {
                        nestedCounts++;
                    }
                    // for now only 1-level deep
                    if (this.isNestedLevelType(line) && nestedCounts === 0) {
                        nestedTypes.push(this.getTypeFromLine(line, 0));
                    }
                    if (this.typedMatched(line, terraformExp)) {
                        parentType = this.getTypeFromLine(line, 0);
                        break;
                    }
                    if (this.typedMatched(line, resourceExp)) {
                        parentType = this.getTypeFromLine(line, 0);
                        parentResource = this.getTypeFromLine(line, 1);
                        break;
                    }
                    prev--;
                }
                if (nestedTypes.length > 0 && parentResource.length > 0) {
                    let resourceInfo = model_1.allProviders[parentType][parentResource];
                    if (!resourceInfo) {
                        return [];
                    }
                    let temp = { items: resourceInfo.args };
                    let fieldArgs = _.cloneDeep(temp).items;
                    if (parentType === "resource") {
                        fieldArgs.push(...model_1.terraformConfigAutoComplete.resource);
                    }
                    fieldArgs.push(...resourceInfo.args);
                    let argumentsLength = nestedTypes.length - 1;
                    let lastArgName = "";
                    while (argumentsLength >= 0) {
                        const field = fieldArgs.find((arg) => arg.name === nestedTypes[argumentsLength]);
                        if (!field) {
                            argumentsLength--;
                            continue;
                        }
                        fieldArgs = field.args;
                        lastArgName = field.name;
                        argumentsLength--;
                    }
                    return this.getItemsForArgs(fieldArgs, lastArgName);
                }
                else if (parentResource.length > 0) {
                    let resourceInfo = model_1.allProviders[parentType][parentResource];
                    if (!resourceInfo) {
                        return [];
                    }
                    let temp = { items: resourceInfo.args };
                    let fieldArgs = _.cloneDeep(temp).items;
                    if (parentType === "resource") {
                        fieldArgs.push(...model_1.terraformConfigAutoComplete.resource);
                    }
                    return this.getItemsForArgs(fieldArgs, parentResource);
                }
                else if (parentType.length > 0 && nestedTypes.length === 0) {
                    let fieldArgs = model_1.terraformConfigAutoComplete[parentType];
                    return this.getItemsForArgs(fieldArgs, parentType);
                }
            }
        }
        catch (error) {
            this.logger.exception("Failed to provide completions", error);
            telemetry_1.Reporter.trackException("provideCompletionItems", error);
        }
        return [];
    }
    lookupForTerraformResource(lineTillCurrentPosition) {
        let parts = lineTillCurrentPosition.split(" ");
        if (parts.length === 2 && (parts[0] === "resource" || parts[0] === "data")) {
            let r = parts[1].replace(/"/g, "");
            let possibleResources = _.filter(_.keys(model_1.allProviders[parts[0]]), (k) => k.indexOf(r) === 0);
            return possibleResources;
        }
        return [];
    }
    getAutoCompletion(strings, type) {
        return _.map(strings, s => {
            return new vscode.CompletionItem(s, type);
        });
    }
    isNestedLevelType(line) {
        for (let i = 0; i < nestedRegexes.length; i++) {
            if (nestedRegexes[i].test(line)) {
                return true;
            }
        }
        return false;
    }
    getTypeFromLine(line, at) {
        let lineParts = line.trim().split(" ");
        let type = lineParts[at];
        return type.replace(/"|=/g, "");
    }
    getItemsForArgs(args, type) {
        return _.map(args, o => {
            let c = new vscode.CompletionItem(`${o.name} (${type})`, vscode.CompletionItemKind.Property);
            c.detail = o.description;
            c.insertText = o.name;
            return c;
        });
    }
    typedMatched(line, exp) {
        return exp.test(line);
    }
    getFilteredTerraformTypes(line) {
        if (line.length === 0) {
            return section_completions_1.SectionCompletions;
        }
        else {
            return section_completions_1.SectionCompletions.filter(v => v.label.indexOf(line) === 0);
        }
    }
    isTerraformTypes(line) {
        return section_completions_1.SectionCompletions.findIndex(v => v.label.indexOf(line) === 0) !== -1;
    }
}
exports.CompletionProvider = CompletionProvider;

//# sourceMappingURL=completion-provider.js.map
