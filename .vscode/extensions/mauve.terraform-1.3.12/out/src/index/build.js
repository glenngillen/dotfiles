"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const version_1 = require("../runner/version");
const ast_1 = require("./ast");
const diagnostic_1 = require("./diagnostic");
const file_index_1 = require("./file-index");
const hcl_hil_1 = require("./hcl-hil");
const location_1 = require("./location");
const position_1 = require("./position");
const property_1 = require("./property");
const range_1 = require("./range");
const reference_1 = require("./reference");
const section_1 = require("./section");
function createPosition(pos, columnDelta = 0, lineDelta = 0) {
    return new position_1.Position(pos.Line - 1 + lineDelta, pos.Column - 1 + columnDelta);
}
function createRange(start, end) {
    return new range_1.Range(createPosition(start), createPosition(end, 1));
}
function locationFromToken(uri, token, strip) {
    const text = ast_1.getText(token, { stripQuotes: strip });
    const start = createPosition(token.Pos, strip ? 1 : 0);
    const end = start.translate({ characterDelta: text.length });
    return new location_1.Location(uri, new range_1.Range(start, end));
}
function extractProperties(uri, list) {
    if (!list || !list.Items)
        return [];
    return list.Items.map((item) => {
        const nameToken = item.Keys[0].Token;
        const name = ast_1.getText(nameToken);
        const nameLocation = locationFromToken(uri, nameToken, false);
        const valueLocation = new location_1.Location(uri, rangeFromVal(item.Val));
        let value;
        if (ast_1.getValueType(item.Val) === ast_1.AstValueType.Map) {
            value = extractProperties(uri, item.Val.List);
        }
        else {
            value = ast_1.getStringValue(item.Val, "", { stripQuotes: true });
        }
        let property = new property_1.Property(name, nameLocation, value, valueLocation, item);
        return property;
    });
}
function sectionFromKeyItemNode(uri, item) {
    const isTypedSection = item.Keys.length === 3;
    const sectionType = item.Keys[0].Token.Text;
    let type = null;
    let typeLoc = null;
    // typed section has name at index 2, untyped at 1
    let nameIndex = 1;
    if (isTypedSection) {
        nameIndex = 2;
        type = ast_1.getText(item.Keys[1].Token, { stripQuotes: true });
        const typeStart = createPosition(item.Keys[1].Token.Pos, 1);
        const typeEnd = typeStart.translate({ characterDelta: type.length });
        typeLoc = new location_1.Location(uri, new range_1.Range(typeStart, typeEnd));
    }
    const name = ast_1.getText(item.Keys[nameIndex].Token, { stripQuotes: true });
    const nameStart = createPosition(item.Keys[nameIndex].Token.Pos, 1);
    const nameStop = nameStart.translate({ characterDelta: name.length });
    const nameLoc = new location_1.Location(uri, new range_1.Range(nameStart, nameStop));
    const location = new location_1.Location(uri, createRange(item.Keys[0].Token.Pos, item.Val.Rbrace));
    return new section_1.Section(sectionType, type, typeLoc, name, nameLoc, location, item, extractProperties(uri, item.Val.List));
}
function startPosFromVal(val) {
    if (val.Lbrace || val.Lbrack)
        return createPosition(val.Lbrace || val.Lbrack);
    return createPosition(val.Token.Pos);
}
function endPosFromVal(val) {
    if (val.Rbrace || val.Rbrack)
        return createPosition(val.Rbrace || val.Rbrack, 1); // for maps/lists
    if (val.Token.Type === 10) {
        // HEREDOC
        // count lines
        const lines = val.Token.Text.split('\n');
        return new position_1.Position(val.Token.Pos.Line - 1 + lines.length - 2, lines[lines.length - 2].length);
        // we subtract 2 from lines.length before adding to start pos to compute
        // end pos because the HEREDOC Token looks like this: <<EOF\nstring\nEOF\n
    }
    return createPosition(val.Token.Pos, val.Token.Text.length); // for strings
}
function rangeFromVal(val) {
    const start = startPosFromVal(val);
    const end = endPosFromVal(val);
    return new range_1.Range(start, end);
}
function sectionFromSingleKeyItemNode(uri, item) {
    const name = item.Keys[0].Token.Text;
    const nameStart = createPosition(item.Keys[0].Token.Pos);
    const nameStop = nameStart.translate({ characterDelta: name.length });
    const nameLoc = new location_1.Location(uri, new range_1.Range(nameStart, nameStop));
    const location = new location_1.Location(uri, new range_1.Range(createPosition(item.Keys[0].Token.Pos), endPosFromVal(item.Val)));
    return new section_1.Section("local", null, null, name, nameLoc, location, item, []);
}
function assignmentFromItemNode(uri, item) {
    const name = item.Keys[0].Token.Text;
    const start = createPosition(item.Keys[0].Token.Pos);
    const end = endPosFromVal(item.Val);
    const location = new location_1.Location(uri, new range_1.Range(start, end));
    let reference = new reference_1.Reference(`var.${name}`, location, null);
    reference.nameRange = new range_1.Range(start, start.translate({ characterDelta: name.length }));
    return reference;
}
function* walkHil(uri, exprs, currentSection) {
    for (let expr of exprs) {
        if (expr.Name && expr.Posx) {
            let name = expr.Name;
            // for now ignore self. and count.
            if (name.startsWith("self.") || name.startsWith("count.")) {
                return;
            }
            let range = new range_1.Range(new position_1.Position(expr.Posx.Line - 1, expr.Posx.Column - 1), new position_1.Position(expr.Posx.Line - 1, expr.Posx.Column - 1 + name.length));
            let location = new location_1.Location(uri, range);
            let reference = new reference_1.Reference(expr.Name, location, currentSection);
            yield reference;
        }
        // handle ternary
        if (expr.CondExpr) {
            yield* walkHil(uri, [expr.CondExpr, expr.TrueExpr, expr.FalseExpr], currentSection);
        }
        if (expr.Key) {
            yield* walkHil(uri, [expr.Key], currentSection);
        }
        if (expr.Target) {
            yield* walkHil(uri, [expr.Target], currentSection);
        }
        if (expr.Args) {
            yield* walkHil(uri, expr.Args, currentSection);
        }
        if (expr.Op) {
            yield* walkHil(uri, expr.Exprs, currentSection);
        }
    }
}
function extractReferencesFromHil(uri, token, currentSection) {
    let [hil, error] = hcl_hil_1.parseHilWithPosition(token.Text, token.Pos.Column, token.Pos.Line, token.Filename);
    if (error) {
        return [null, new hcl_hil_1.ParseError(token, error.message)];
    }
    if (!hil.Exprs) {
        // no expressions found in the HIL
        return [[], null];
    }
    return [[...walkHil(uri, hil.Exprs, currentSection)], null];
}
function childOfLocalsSection(p) {
    if (p.length < 3)
        return false;
    if (p[p.length - 3].type !== ast_1.NodeType.Item)
        return false;
    const item = p[p.length - 3].node;
    if (item.Keys.length === 0)
        return false;
    return item.Keys[0].Token.Text === "locals";
}
function parseRequiredVersion(requiredVersionStr, range) {
    let requirement;
    let diagnostic;
    try {
        requirement = version_1.VersionRequirement.parse(requiredVersionStr);
    }
    catch (err) {
        diagnostic = new diagnostic_1.Diagnostic(range, err.message, diagnostic_1.DiagnosticSeverity.ERROR);
    }
    return [requirement, diagnostic];
}
function terraformSectionFromItemNode(uri, node) {
    const requiredVersionVal = ast_1.findValue(node, "required_version");
    const requiredVersionStr = ast_1.getStringValue(requiredVersionVal, "", { stripQuotes: true });
    const start = createPosition(node.Keys[0].Token.Pos);
    const end = endPosFromVal(node.Val);
    const location = new location_1.Location(uri, new range_1.Range(start, end));
    if (requiredVersionStr !== "" && requiredVersionVal) {
        const [requirement, diagnostic] = parseRequiredVersion(requiredVersionStr, rangeFromVal(requiredVersionVal));
        const section = new file_index_1.TerraformSection(requiredVersionStr, requirement, location, node);
        return [section, diagnostic];
    }
    else {
        const section = new file_index_1.TerraformSection(requiredVersionStr, null, location, node);
        // Really cool idea but needs some refinement before we can annoy people into adding required_version
        // return [section, new Diagnostic(location.range, "terraform statement without a required_version attribute", DiagnosticSeverity.WARNING)];
        return [section, null];
    }
}
function build(uri, ast) {
    if (!ast) {
        throw "ast cannot be null";
    }
    let result = new file_index_1.FileIndex(uri);
    let currentSection = null;
    let currentDepth = 0;
    ast_1.walk(ast, (type, node, path, index, array) => {
        if (path.length === currentDepth && currentSection) {
            // push section into index
            currentDepth = 0;
            result.add(currentSection);
            currentSection = null;
        }
        if (type === ast_1.NodeType.Item) {
            // detect variable assignments
            if (node.Keys.length === 1) {
                // handle top-level things
                if (path.length === 2) {
                    if (node.Keys[0].Token.Text === "terraform") {
                        let [terraformSection, diagnostic] = terraformSectionFromItemNode(uri, node);
                        result.terraform = terraformSection;
                        if (diagnostic)
                            result.diagnostics.push(diagnostic);
                        return;
                    }
                    // assignment nodes (like we want) have an actual valid assignment
                    // position, whereas single key sections (like terraform, locals)
                    // do not
                    if (node.Assign.Line === 0 && node.Assign.Column === 0)
                        return;
                    // TODO: we should part move this parsing into a separate
                    //       parser which only handles tfvars files
                    // only top-level assignments
                    let assignment = assignmentFromItemNode(uri, node);
                    if (assignment) {
                        result.assignments.push(assignment);
                    }
                    return;
                }
                else {
                    if (childOfLocalsSection(path)) {
                        currentDepth = path.length;
                        currentSection = sectionFromSingleKeyItemNode(uri, node);
                        return;
                    }
                }
            }
            // detect section
            if (node.Keys.length === 2 || node.Keys.length === 3) {
                if (currentSection) {
                    result.add(currentSection);
                }
                currentDepth = path.length;
                currentSection = sectionFromKeyItemNode(uri, node);
                return;
            }
        }
        if (type === ast_1.NodeType.Value) {
            // we can later use path to go up and detect what type
            // of value we are currently processing but right now we are
            // only using it to collect references
            //
            // the AST contains chains like this Val > Keys > Items > [Val > Token.Type==9]
            // we only care about the second Val in the above example, we use
            // Token.Type==9 to detect it
            // Token.Type==10 is for heredoc
            if (node.Token && (node.Token.Type === 9 || node.Token.Type === 10)) {
                if (!currentSection) {
                    // TODO: this happens in tfvars files, should probably handle those
                    return;
                }
                let [references, error] = extractReferencesFromHil(uri, node.Token, currentSection);
                if (error) {
                    const range = new range_1.Range(new position_1.Position(error.line, error.column), new position_1.Position(error.line, node.Token.Pos.Column - 1 + node.Token.Text.length));
                    let message = error.message;
                    if (!message) {
                        message = "Could not parse expression";
                    }
                    message = message.replace(/^parse error at undefined:[0-9]+:[0-9]+:\s+/, '');
                    const diagnostic = new diagnostic_1.Diagnostic(range, message, diagnostic_1.DiagnosticSeverity.ERROR);
                    result.diagnostics.push(diagnostic);
                    return;
                }
                currentSection.references.push(...references);
                return;
            }
        }
    });
    // handle last section
    if (currentSection) {
        result.add(currentSection);
    }
    return result;
}
exports.build = build;

//# sourceMappingURL=build.js.map
