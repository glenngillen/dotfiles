"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSolidityRemappings = exports.getCurrentWorkspaceRootFolder = exports.getCurrentWorkspaceRootFsPath = void 0;
const vscode = require("vscode");
const util_1 = require("../common/util");
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
function getSolidityRemappings() {
    const remappings = vscode.workspace.getConfiguration('solidity').get('remappings');
    if (process.platform === 'win32') {
        return util_1.replaceRemappings(remappings, vscode.workspace.getConfiguration('solidity').get('remappingsWindows'));
    }
    else {
        return util_1.replaceRemappings(remappings, vscode.workspace.getConfiguration('solidity').get('remappingsUnix'));
    }
}
exports.getSolidityRemappings = getSolidityRemappings;
//# sourceMappingURL=workspaceUtil.js.map