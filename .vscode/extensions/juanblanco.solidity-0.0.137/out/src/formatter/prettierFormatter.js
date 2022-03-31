"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDocument = void 0;
const prettier = require("prettier");
const vscode = require("vscode");
const path = require("path");
const workspaceUtil = require("../workspaceUtil");
function formatDocument(document, context) {
    const formatter = vscode.workspace.getConfiguration('solidity').get('formatter');
    if (formatter === 'prettier') {
        const rootPath = workspaceUtil.getCurrentWorkspaceRootFsPath();
        const ignoreOptions = { ignorePath: path.join(rootPath, '.prettierignore') };
        const fileInfo = prettier.getFileInfo.sync(document.uri.fsPath, ignoreOptions);
        if (!fileInfo.ignored) {
            const source = document.getText();
            const pluginPath = path.join(context.extensionPath, 'node_modules', 'prettier-plugin-solidity');
            const options = {
                'parser': 'solidity-parse',
                'pluginSearchDirs': [context.extensionPath],
                'plugins': [pluginPath],
            };
            const config = prettier.resolveConfig.sync(document.uri.fsPath, options);
            Object.assign(options, config);
            const firstLine = document.lineAt(0);
            const lastLine = document.lineAt(document.lineCount - 1);
            const fullTextRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
            const formatted = prettier.format(source, options);
            return [vscode.TextEdit.replace(fullTextRange, formatted)];
        }
    }
    return null;
}
exports.formatDocument = formatDocument;
//# sourceMappingURL=prettierFormatter.js.map