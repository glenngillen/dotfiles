'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const solcCompiler_1 = require("./common/solcCompiler");
const solhint_1 = require("./server/linter/solhint");
const solium_1 = require("./server/linter/solium");
const completionService_1 = require("./server/completionService");
const definitionProvider_1 = require("./server/definitionProvider");
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const util_1 = require("./common/util");
// import * as path from 'path';
// Create a connection for the server
const connection = node_1.createConnection(node_1.ProposedFeatures.all);
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
let rootPath;
let solcCompiler;
let linter = null;
let enabledAsYouTypeErrorCheck = false;
let compileUsingRemoteVersion = '';
let compileUsingLocalVersion = '';
let nodeModulePackage = '';
let defaultCompiler = solcCompiler_1.compilerType.embedded;
let solhintDefaultRules = {};
let soliumDefaultRules = {};
let validationDelay = 1500;
let solcCachePath = '';
let hasWorkspaceFolderCapability = false;
// flags to avoid trigger concurrent validations (compiling is slow)
let validatingDocument = false;
let validatingAllDocuments = false;
let packageDefaultDependenciesDirectory = 'lib';
let packageDefaultDependenciesContractsDirectory = 'src';
let workspaceFolders;
let remappings;
function initWorkspaceRootFolder(uri) {
    if (rootPath !== 'undefined') {
        const fullUri = vscode_uri_1.URI.parse(uri);
        if (!fullUri.fsPath.startsWith(rootPath)) {
            if (workspaceFolders) {
                const newRootFolder = workspaceFolders.find(x => uri.startsWith(x.uri));
                if (newRootFolder !== undefined) {
                    rootPath = vscode_uri_1.URI.parse(newRootFolder.uri).fsPath;
                    solcCompiler.rootPath = rootPath;
                    if (linter !== null) {
                        linter.loadFileConfig(rootPath);
                    }
                }
            }
        }
    }
}
function validate(document) {
    try {
        initWorkspaceRootFolder(document.uri);
        validatingDocument = true;
        const uri = document.uri;
        const filePath = vscode_uri_1.URI.parse(uri).fsPath;
        const documentText = document.getText();
        let linterDiagnostics = [];
        const compileErrorDiagnostics = [];
        try {
            if (linter !== null) {
                linterDiagnostics = linter.validate(filePath, documentText);
            }
        }
        catch (_a) {
            // gracefull catch
        }
        try {
            if (enabledAsYouTypeErrorCheck) {
                const errors = solcCompiler
                    .compileSolidityDocumentAndGetDiagnosticErrors(filePath, documentText, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory, remappings);
                errors.forEach(errorItem => {
                    const uriCompileError = vscode_uri_1.URI.file(errorItem.fileName);
                    if (uriCompileError.toString() === uri) {
                        compileErrorDiagnostics.push(errorItem.diagnostic);
                    }
                });
            }
        }
        catch (e) {
            const x = e; // gracefull catch
        }
        const diagnostics = linterDiagnostics.concat(compileErrorDiagnostics);
        connection.sendDiagnostics({ diagnostics, uri });
    }
    finally {
        validatingDocument = false;
    }
}
connection.onSignatureHelp(() => {
    return null;
});
connection.onCompletion((textDocumentPosition) => {
    let completionItems = [];
    const document = documents.get(textDocumentPosition.textDocument.uri);
    const service = new completionService_1.CompletionService(rootPath);
    completionItems = completionItems.concat(service.getAllCompletionItems(packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory, remappings, document, textDocumentPosition.position));
    return completionItems;
});
connection.onDefinition((handler) => {
    const provider = new definitionProvider_1.SolidityDefinitionProvider(rootPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory, remappings);
    return provider.provideDefinition(documents.get(handler.textDocument.uri), handler.position);
});
// This handler resolve additional information for the item selected in
// the completion list.
// connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
//   item.
// });
function validateAllDocuments() {
    if (!validatingAllDocuments) {
        try {
            validatingAllDocuments = true;
            documents.all().forEach(document => validate(document));
        }
        finally {
            validatingAllDocuments = false;
        }
    }
}
function startValidation() {
    if (enabledAsYouTypeErrorCheck) {
        solcCompiler.initialiseAllCompilerSettings(compileUsingRemoteVersion, compileUsingLocalVersion, nodeModulePackage, defaultCompiler);
        solcCompiler.initialiseSelectedCompiler().then(() => {
            connection.console.info('Validating using the compiler selected: ' + solcCompiler_1.compilerType[defaultCompiler]);
            validateAllDocuments();
        }).catch(reason => {
            connection.console.error('An error has occurred initialising the compiler selected ' + solcCompiler_1.compilerType[defaultCompiler] + ', please check your settings, reverting to the embedded compiler. Error: ' + reason);
            solcCompiler.initialiseAllCompilerSettings(compileUsingRemoteVersion, compileUsingLocalVersion, nodeModulePackage, solcCompiler_1.compilerType.embedded);
            solcCompiler.initialiseSelectedCompiler().then(() => {
                validateAllDocuments();
                // tslint:disable-next-line:no-shadowed-variable disable-next-line:no-empty
            }).catch(reason => { });
        });
    }
    else {
        validateAllDocuments();
    }
}
documents.onDidChangeContent(event => {
    const document = event.document;
    if (!validatingDocument && !validatingAllDocuments) {
        validatingDocument = true; // control the flag at a higher level
        // slow down, give enough time to type (1.5 seconds?)
        setTimeout(() => validate(document), validationDelay);
    }
});
// remove diagnostics from the Problems panel when we close the file
documents.onDidClose(event => connection.sendDiagnostics({
    diagnostics: [],
    uri: event.document.uri,
}));
documents.listen(connection);
connection.onInitialize((params) => {
    rootPath = params.rootPath;
    const capabilities = params.capabilities;
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    if (params.workspaceFolders) {
        workspaceFolders = params.workspaceFolders;
    }
    solcCachePath = params.initializationOptions;
    solcCompiler = new solcCompiler_1.SolcCompiler(rootPath);
    solcCompiler.setSolcCache(solcCachePath);
    const result = {
        capabilities: {
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: ['.'],
            },
            definitionProvider: true,
            textDocumentSync: node_1.TextDocumentSyncKind.Full,
        },
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true,
            },
        };
    }
    return result;
});
connection.onInitialized(() => {
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            if (connection.workspace !== undefined) {
                connection.workspace.onDidChangeWorkspaceFolders((event) => {
                    event.removed.forEach(workspaceFolder => {
                        const index = workspaceFolders.findIndex((folder) => folder.uri === workspaceFolder.uri);
                        if (index !== -1) {
                            workspaceFolders.splice(index, 1);
                        }
                    });
                    event.added.forEach(workspaceFolder => {
                        workspaceFolders.push(workspaceFolder);
                    });
                });
            }
        });
    }
});
connection.onDidChangeWatchedFiles(_change => {
    if (linter !== null) {
        linter.loadFileConfig(rootPath);
    }
    validateAllDocuments();
});
connection.onDidChangeConfiguration((change) => {
    const settings = change.settings;
    enabledAsYouTypeErrorCheck = settings.solidity.enabledAsYouTypeCompilationErrorCheck;
    compileUsingLocalVersion = settings.solidity.compileUsingLocalVersion;
    compileUsingRemoteVersion = settings.solidity.compileUsingRemoteVersion;
    solhintDefaultRules = settings.solidity.solhintRules;
    soliumDefaultRules = settings.solidity.soliumRules;
    validationDelay = settings.solidity.validationDelay;
    nodeModulePackage = settings.solidity.nodemodulespackage;
    defaultCompiler = solcCompiler_1.compilerType[settings.solidity.defaultCompiler];
    packageDefaultDependenciesContractsDirectory = settings.solidity.packageDefaultDependenciesContractsDirectory;
    packageDefaultDependenciesDirectory = settings.solidity.packageDefaultDependenciesDirectory;
    remappings = settings.solidity.remappings;
    if (process.platform === 'win32') {
        remappings = util_1.replaceRemappings(remappings, settings.solidity.remappingsWindows);
    }
    else {
        remappings = util_1.replaceRemappings(remappings, settings.solidity.remappingsUnix);
    }
    switch (linterName(settings.solidity)) {
        case 'solhint': {
            linter = new solhint_1.default(rootPath, solhintDefaultRules);
            break;
        }
        case 'solium': {
            linter = new solium_1.default(rootPath, soliumDefaultRules, connection);
            break;
        }
        default: {
            linter = null;
        }
    }
    if (linter !== null) {
        linter.setIdeRules(linterRules(settings.solidity));
    }
    startValidation();
});
function linterName(settings) {
    return settings.linter;
}
function linterRules(settings) {
    const _linterName = linterName(settings);
    if (_linterName === 'solium') {
        return settings.soliumRules;
    }
    else {
        return settings.solhintRules;
    }
}
connection.listen();
//# sourceMappingURL=server.js.map