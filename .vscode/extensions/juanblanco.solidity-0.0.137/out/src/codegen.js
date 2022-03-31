'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeGenerateCQS = exports.codeGenerateAllFilesFromAbiInCurrentFolder = exports.codeGenerateNethereumCQSCSharpAll = exports.codeGenerateNethereumCQSFSharpAll = exports.codeGenerateNethereumCQSVbAll = exports.codeGenerateNethereumCQSFSharp = exports.codeGenerateNethereumCQSVbNet = exports.codeGenerateNethereumCQSCsharp = exports.generateNethereumCodeSettingsFile = exports.getProjectExtensionFromLang = exports.autoCodeGenerateAfterCompilation = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const codegen = require("nethereum-codegen");
const projectService_1 = require("./projectService");
const workspaceUtil = require("./workspaceUtil");
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
    const root = workspaceUtil.getCurrentWorkspaceRootFolder();
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
            'projectPath': '../',
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
    const rootPath = workspaceUtil.getCurrentWorkspaceRootFsPath();
    const remappings = vscode.workspace.getConfiguration('solidity').get('remappings');
    const project = projectService_1.initialiseProject(rootPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory, remappings);
    return path.join(rootPath, project.projectPackage.build_dir);
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
function codeGenerateAllFilesFromAbiInCurrentFolder(lang, args, diagnostics) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // We need something open
    }
    const buildPath = path.dirname(editor.document.uri.fsPath);
    const outputPath = '**/*.abi';
    const files = vscode.workspace.findFiles(outputPath, null, 1000);
    files.then(documents => {
        documents.forEach(document => {
            if (document.fsPath.startsWith(buildPath)) {
                codeGenerateCQS(document.fsPath, lang, args, diagnostics);
            }
        });
    });
}
exports.codeGenerateAllFilesFromAbiInCurrentFolder = codeGenerateAllFilesFromAbiInCurrentFolder;
function getCodeGenerationSettings() {
    const root = workspaceUtil.getCurrentWorkspaceRootFolder();
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
        const root = workspaceUtil.getCurrentWorkspaceRootFolder();
        const settings = getCodeGenerationSettings();
        const prettyRootName = prettifyRootNameAsNamespace(root.name);
        let baseNamespace = prettyRootName + '.Contracts';
        let projectName = baseNamespace;
        let projectPath = path.join(root.uri.fsPath);
        let useFolderAsNamespace = false;
        let ignorePrefixFolder = '';
        if (settings !== undefined) {
            if (settings.projectName !== undefined) {
                projectName = settings.projectName;
                baseNamespace = settings.namespace;
            }
            if (settings.projectPath !== undefined) {
                projectPath = path.join(projectPath, settings.projectPath);
            }
            if (settings.useFolderAsNamespace !== undefined) {
                useFolderAsNamespace = settings.useFolderAsNamespace;
            }
            if (settings.ignorePrefixFolder !== undefined) {
                ignorePrefixFolder = settings.ignorePrefixFolder;
            }
        }
        const outputPathInfo = path.parse(fileName);
        const contractName = outputPathInfo.name;
        let compilationOutput;
        let abi = undefined;
        let bytecode = '0x';
        if (outputPathInfo.ext === '.abi') {
            abi = fs.readFileSync(fileName, 'utf8');
            compilationOutput = { 'abi': abi, 'bytecode': '0x' };
            const binFile = fileName.substr(0, fileName.lastIndexOf('.')) + '.bin';
            if (fs.existsSync(binFile)) {
                let bytecode = fs.readFileSync(binFile, 'utf8');
            }
        }
        else {
            compilationOutput = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            abi = JSON.stringify(compilationOutput.abi);
            bytecode = compilationOutput.bytecode;
        }
        if (abi !== undefined) {
            const projectFullPath = path.join(projectPath, projectName + extension);
            if (!fs.existsSync(projectFullPath)) {
                codegen.generateNetStandardClassLibrary(projectName, projectPath, lang);
            }
            if (useFolderAsNamespace) {
                let pathFullIgnore = path.join(getBuildPath(), ignorePrefixFolder);
                let dirPath = path.dirname(fileName);
                let testPath = '';
                if (dirPath.startsWith(pathFullIgnore)) {
                    testPath = path.relative(pathFullIgnore, path.dirname(fileName));
                    //make upper case the first char in a folder
                    testPath = prettifyRootNameAsNamespaceWithSplitString(testPath, path.sep, path.sep);
                }
                projectPath = path.join(projectPath, testPath);
                let trailingNameSpace = prettifyRootNameAsNamespaceWithSplitString(testPath, path.sep, '.').trim();
                if (trailingNameSpace != '') {
                    baseNamespace = baseNamespace + '.' + trailingNameSpace;
                }
            }
            codegen.generateAllClasses(abi, bytecode, contractName, baseNamespace, projectPath, lang);
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
exports.codeGenerateCQS = codeGenerateCQS;
// remove - and make upper case
function prettifyRootNameAsNamespace(value) {
    return prettifyRootNameAsNamespaceWithSplitString(value, '-', '');
}
function prettifyRootNameAsNamespaceWithSplitString(value, splitChar, joinChar) {
    return value.split(splitChar).map(function capitalize(part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(joinChar);
}
//# sourceMappingURL=codegen.js.map