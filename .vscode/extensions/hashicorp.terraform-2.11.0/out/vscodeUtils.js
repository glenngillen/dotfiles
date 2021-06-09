"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortedWorkspaceFolders = exports.prunedFolderNames = exports.getWorkspaceFolder = exports.normalizeFolderName = exports.getFolderName = exports.config = void 0;
const vscode = require("vscode");
function config(section, scope) {
    return vscode.workspace.getConfiguration(section, scope);
}
exports.config = config;
function getFolderName(folder) {
    return normalizeFolderName(folder.uri.toString());
}
exports.getFolderName = getFolderName;
// Make sure that folder uris always end with a slash
function normalizeFolderName(folderName) {
    if (folderName.charAt(folderName.length - 1) !== '/') {
        folderName = folderName + '/';
    }
    return folderName;
}
exports.normalizeFolderName = normalizeFolderName;
function getWorkspaceFolder(folderName) {
    return vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(folderName));
}
exports.getWorkspaceFolder = getWorkspaceFolder;
function prunedFolderNames(folders = vscode.workspace.workspaceFolders) {
    const result = [];
    // Sort workspace folders so that outer folders (shorter path) go before inner ones
    const workspaceFolders = sortedWorkspaceFolders();
    if (folders && workspaceFolders) {
        const folderNames = folders.map(f => getFolderName(f));
        for (let name of folderNames) {
            const outerFolder = workspaceFolders.find(element => name.startsWith(element));
            // If this folder isn't nested, the found item will be itself
            if (outerFolder && (outerFolder !== name)) {
                name = getFolderName(getWorkspaceFolder(outerFolder));
            }
            result.push(name);
        }
    }
    return result;
}
exports.prunedFolderNames = prunedFolderNames;
function sortedWorkspaceFolders() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        return vscode.workspace.workspaceFolders.map(f => getFolderName(f)).sort((a, b) => {
            return a.length - b.length;
        });
    }
    return [];
}
exports.sortedWorkspaceFolders = sortedWorkspaceFolders;
//# sourceMappingURL=vscodeUtils.js.map