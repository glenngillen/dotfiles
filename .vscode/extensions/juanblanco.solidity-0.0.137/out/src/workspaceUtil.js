"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentWorkspaceRootFolder = exports.getCurrentWorkspaceRootFsPath = void 0;
const vscode = require("vscode");
function getCurrentWorkspaceRootFsPath() {
    return getCurrentWorkspaceRootFolder().uri.fsPath;
}
exports.getCurrentWorkspaceRootFsPath = getCurrentWorkspaceRootFsPath;
function getCurrentWorkspaceRootFolder() {
    var editor = vscode.window.activeTextEditor;
    const currentDocument = editor.document.uri;
    return vscode.workspace.getWorkspaceFolder(currentDocument);
}
exports.getCurrentWorkspaceRootFolder = getCurrentWorkspaceRootFolder;
//# sourceMappingURL=workspaceUtil.js.map