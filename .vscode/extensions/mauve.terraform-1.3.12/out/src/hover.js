"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ast_1 = require("./index/ast");
const ast_helpers_1 = require("./index/ast-helpers");
const vscode_adapter_1 = require("./index/vscode-adapter");
const logger_1 = require("./logger");
const telemetry_1 = require("./telemetry");
class HoverProvider {
    constructor(index) {
        this.index = index;
        this.logger = new logger_1.Logger("hover-provider");
    }
    provideHover(document, position, token) {
        try {
            let [file, group] = this.index.indexDocument(document);
            if (!file || !group)
                return null;
            let reference = group.queryReferences(document.uri, { position: vscode_adapter_1.from_vscode_Position(position) })[0];
            if (!reference)
                return null;
            let section = group.query("ALL_FILES", reference.getQuery())[0];
            if (!section)
                return new vscode.Hover(new vscode.MarkdownString(`Unknown target \`${reference.targetId}\``), vscode_adapter_1.to_vscode_Range(reference.location.range));
            let valuePath = reference.valuePath();
            let label = valuePath[0];
            if (section.sectionType === "variable") {
                valuePath = ["default"];
                label = valuePath[0];
            }
            else if (section.sectionType === "local") {
                valuePath = [null];
                label = section.name;
            }
            else {
                // we need an attribute to read and it cannot be a splat
                if (valuePath.length === 0 || valuePath[0] === "*") {
                    return null;
                }
            }
            // for now only support single level value extraction
            let valueNode = ast_1.findValue(section.node, valuePath[0]);
            if (!valueNode)
                return new vscode.Hover(`\`${label}\` not specified`, vscode_adapter_1.to_vscode_Range(reference.location.range));
            let formattedString = `${label}: ${ast_helpers_1.valueToMarkdown(valueNode, 0)}`;
            return new vscode.Hover(new vscode.MarkdownString(formattedString), vscode_adapter_1.to_vscode_Range(reference.location.range));
        }
        catch (error) {
            this.logger.exception("Could not provide hover", error);
            telemetry_1.Reporter.trackException("provideHover", error);
        }
    }
}
exports.HoverProvider = HoverProvider;

//# sourceMappingURL=hover.js.map
