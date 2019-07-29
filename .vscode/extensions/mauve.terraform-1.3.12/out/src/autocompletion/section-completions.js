"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function variableEmptyCompletion() {
    let item = new vscode.CompletionItem("variable", vscode.CompletionItemKind.Variable);
    item.detail = "empty";
    let snippet = 'variable "${1:name}" {\n' +
        '  $0\n' +
        '}\n';
    item.insertText = new vscode.SnippetString(snippet);
    return item;
}
function variableWithDefaultCompletion() {
    let item = new vscode.CompletionItem("variable", vscode.CompletionItemKind.Variable);
    item.detail = "with default";
    let snippet = 'variable "${1:name}" {\n' +
        '  default = "${2:value}"\n' +
        '}\n';
    item.insertText = new vscode.SnippetString(snippet);
    return item;
}
function variableWithDocumentationAndValueCompletion() {
    let item = new vscode.CompletionItem("variable", vscode.CompletionItemKind.Variable);
    item.detail = "with default and description";
    let snippet = 'variable "${1:name}" {\n' +
        '  description = "${2:description}"\n' +
        '  default = "${3:value}"\n' +
        '}\n' +
        '$0';
    item.insertText = new vscode.SnippetString(snippet);
    return item;
}
function outputCompletion() {
    let item = new vscode.CompletionItem("output", vscode.CompletionItemKind.Variable);
    let snippet = 'output "${1:name}" {\n' +
        '  value = "${2:value}"\n' +
        '}\n';
    item.insertText = new vscode.SnippetString(snippet);
    return item;
}
function resourceCompletion() {
    let item = new vscode.CompletionItem("resource", vscode.CompletionItemKind.Interface);
    let snippet = 'resource "${1:type}" "${2:name}" {\n' +
        '  $0\n' +
        '}\n';
    item.insertText = new vscode.SnippetString(snippet);
    return item;
}
function dataCompletion() {
    let item = new vscode.CompletionItem("data", vscode.CompletionItemKind.Interface);
    let snippet = 'data "${1:type}" "${2:name}" {\n' +
        '  $0\n' +
        '}\n';
    item.insertText = new vscode.SnippetString(snippet);
    return item;
}
function localsCompletion() {
    let item = new vscode.CompletionItem("locals", vscode.CompletionItemKind.Class);
    let snippet = 'locals {\n' +
        '  $0\n' +
        '}\n';
    item.insertText = new vscode.SnippetString(snippet);
    return item;
}
function moduleCompletion() {
    let item = new vscode.CompletionItem("module", vscode.CompletionItemKind.Module);
    let snippet = 'module "${1:name}" {\n' +
        '  source = "${2:source}"\n' +
        '  $0\n' +
        '}\n';
    item.insertText = new vscode.SnippetString(snippet);
    return item;
}
function providerCompletion() {
    let item = new vscode.CompletionItem("provider", vscode.CompletionItemKind.Module);
    let snippet = 'provider "${1:name}" {\n' +
        '  $0\n' +
        '}\n';
    item.insertText = new vscode.SnippetString(snippet);
    return item;
}
exports.SectionCompletions = [
    variableEmptyCompletion(),
    variableWithDefaultCompletion(),
    variableWithDocumentationAndValueCompletion(),
    outputCompletion(),
    resourceCompletion(),
    dataCompletion(),
    localsCompletion(),
    moduleCompletion(),
    providerCompletion()
];

//# sourceMappingURL=section-completions.js.map
