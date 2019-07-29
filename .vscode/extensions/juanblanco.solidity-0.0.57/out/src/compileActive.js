'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const compiler_1 = require("./compiler");
const contractsCollection_1 = require("./model/contractsCollection");
const projectService_1 = require("./projectService");
const util_1 = require("./util");
let diagnosticCollection;
function initDiagnosticCollection(diagnostics) {
    diagnosticCollection = diagnostics;
}
exports.initDiagnosticCollection = initDiagnosticCollection;
function compileActiveContract() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // We need something open
    }
    if (path.extname(editor.document.fileName) !== '.sol') {
        vscode.window.showWarningMessage('This not a solidity file (*.sol)');
        return;
    }
    // Check if is folder, if not stop we need to output to a bin folder on rootPath
    if (vscode.workspace.rootPath === undefined) {
        vscode.window.showWarningMessage('Please open a folder in Visual Studio Code as a workspace');
        return;
    }
    const contractsCollection = new contractsCollection_1.ContractCollection();
    const contractCode = editor.document.getText();
    const contractPath = editor.document.fileName;
    const packageDefaultDependenciesDirectory = vscode.workspace.getConfiguration('solidity').get('packageDefaultDependenciesDirectory');
    const packageDefaultDependenciesContractsDirectory = vscode.workspace.getConfiguration('solidity').get('packageDefaultDependenciesContractsDirectory');
    const project = projectService_1.initialiseProject(vscode.workspace.rootPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory);
    const contract = contractsCollection.addContractAndResolveImports(contractPath, contractCode, project);
    const packagesPath = util_1.formatPath(project.packagesDir);
    return compiler_1.compile(contractsCollection.getDefaultContractsForCompilation(), diagnosticCollection, project.projectPackage.build_dir, project.projectPackage.absoluletPath, null, packagesPath, contract.absolutePath);
}
exports.compileActiveContract = compileActiveContract;
//# sourceMappingURL=compileActive.js.map