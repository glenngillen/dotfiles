'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const codegen = require("nethereum-codegen");
const projectService_1 = require("./projectService");
function autoCodeGenerateAfterCompilation(compiledFiles, args, diagnostics) {
    if (compiledFiles !== undefined && compiledFiles.length > 0) {
        const settings = getCodeGenerationSettings();
        if (settings !== undefined) {
            if (settings.autoCodeGen === true) {
                let lang = 0;
                if (settings.lang !== undefined) {
                    lang = settings.lang;
                }
                compiledFiles.forEach(file => {
                    codeGenerateCQS(file, lang, args, diagnostics);
                });
            }
        }
    }
}
exports.autoCodeGenerateAfterCompilation = autoCodeGenerateAfterCompilation;
function getProjectExtensionFromLang(lang) {
    switch (lang) {
        case 0:
            return '.csproj';
        case 1:
            return '.vbproj';
        case 3:
            return '.fsproj';
    }
}
exports.getProjectExtensionFromLang = getProjectExtensionFromLang;
function generateNethereumCodeSettingsFile() {
    const root = vscode.workspace.workspaceFolders[0];
    const settingsFile = path.join(root.uri.fsPath, 'nethereum-gen.settings');
    if (!fs.existsSync(settingsFile)) {
        const prettyRootName = prettifyRootNameAsNamespace(root.name);
        const baseNamespace = prettyRootName + '.Contracts';
        const jsonSettings = {
            'projectName': prettyRootName,
            // tslint:disable-next-line:object-literal-sort-keys
            'namespace': baseNamespace,
            'lang': 0,
            'autoCodeGen': true,
        };
        fs.writeFileSync(settingsFile, JSON.stringify(jsonSettings, null, 4));
    }
}
exports.generateNethereumCodeSettingsFile = generateNethereumCodeSettingsFile;
function codeGenerateNethereumCQSCsharp(args, diagnostics) {
    const lang = 0;
    const editor = vscode.window.activeTextEditor;
    const fileName = editor.document.fileName;
    codeGenerateCQS(fileName, lang, args, diagnostics);
}
exports.codeGenerateNethereumCQSCsharp = codeGenerateNethereumCQSCsharp;
function codeGenerateNethereumCQSVbNet(args, diagnostics) {
    const lang = 1;
    const editor = vscode.window.activeTextEditor;
    const fileName = editor.document.fileName;
    codeGenerateCQS(fileName, lang, args, diagnostics);
}
exports.codeGenerateNethereumCQSVbNet = codeGenerateNethereumCQSVbNet;
function codeGenerateNethereumCQSFSharp(args, diagnostics) {
    const lang = 3;
    const editor = vscode.window.activeTextEditor;
    const fileName = editor.document.fileName;
    codeGenerateCQS(fileName, lang, args, diagnostics);
}
exports.codeGenerateNethereumCQSFSharp = codeGenerateNethereumCQSFSharp;
function codeGenerateNethereumCQSVbAll(args, diagnostics) {
    const lang = 1;
    codeGenerateAllFiles(lang, args, diagnostics);
}
exports.codeGenerateNethereumCQSVbAll = codeGenerateNethereumCQSVbAll;
function codeGenerateNethereumCQSFSharpAll(args, diagnostics) {
    const lang = 3;
    codeGenerateAllFiles(lang, args, diagnostics);
}
exports.codeGenerateNethereumCQSFSharpAll = codeGenerateNethereumCQSFSharpAll;
function codeGenerateNethereumCQSCSharpAll(args, diagnostics) {
    const lang = 0;
    codeGenerateAllFiles(lang, args, diagnostics);
}
exports.codeGenerateNethereumCQSCSharpAll = codeGenerateNethereumCQSCSharpAll;
function getBuildPath() {
    const packageDefaultDependenciesDirectory = vscode.workspace.getConfiguration('solidity').get('packageDefaultDependenciesDirectory');
    const packageDefaultDependenciesContractsDirectory = vscode.workspace.getConfiguration('solidity').get('packageDefaultDependenciesContractsDirectory');
    const project = projectService_1.initialiseProject(vscode.workspace.rootPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory);
    return path.join(vscode.workspace.rootPath, project.projectPackage.build_dir);
}
function codeGenerateAllFiles(lang, args, diagnostics) {
    const buildPath = getBuildPath();
    const outputPath = '**/*.json';
    const files = vscode.workspace.findFiles(outputPath, null, 1000);
    files.then(documents => {
        documents.forEach(document => {
            if (document.fsPath.startsWith(buildPath)) {
                codeGenerateCQS(document.fsPath, lang, args, diagnostics);
            }
        });
    });
}
function getCodeGenerationSettings() {
    const root = vscode.workspace.workspaceFolders[0];
    const settingsFile = path.join(root.uri.fsPath, 'nethereum-gen.settings');
    if (fs.existsSync(settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        return settings;
    }
    return undefined;
}
function codeGenerateCQS(fileName, lang, args, diagnostics) {
    try {
        const extension = getProjectExtensionFromLang(lang);
        const root = vscode.workspace.workspaceFolders[0];
        const settings = getCodeGenerationSettings();
        const prettyRootName = prettifyRootNameAsNamespace(root.name);
        let baseNamespace = prettyRootName + '.Contracts';
        let projectName = baseNamespace;
        if (settings !== undefined) {
            if (settings.projectName !== undefined) {
                projectName = settings.projectName;
                baseNamespace = settings.namespace;
            }
        }
        const outputPathInfo = path.parse(fileName);
        const contractName = outputPathInfo.name;
        const projectPath = path.join(root.uri.fsPath);
        const compilationOutput = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        if (compilationOutput.abi !== undefined) {
            const abi = JSON.stringify(compilationOutput.abi);
            const contractByteCode = compilationOutput.bytecode;
            const projectFullPath = path.join(projectPath, projectName + extension);
            if (!fs.existsSync(projectFullPath)) {
                codegen.generateNetStandardClassLibrary(projectName, projectPath, lang);
            }
            codegen.generateAllClasses(abi, contractByteCode, contractName, baseNamespace, projectPath, lang);
        }
    }
    catch (e) {
        const outputChannel = vscode.window.createOutputChannel('solidity code generation');
        outputChannel.clear();
        outputChannel.appendLine('Error generating code:');
        outputChannel.appendLine(e.message);
        outputChannel.show();
    }
}
// remove - and make upper case
function prettifyRootNameAsNamespace(value) {
    return value.split('-').map(function capitalize(part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
    }).join('');
}
//# sourceMappingURL=codegen.js.map