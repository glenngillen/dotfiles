'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const solcCompiler_1 = require("./solcCompiler");
const solhint_1 = require("./linter/solhint");
const solium_1 = require("./linter/solium");
const completionService_1 = require("./completionService");
const definitionProvider_1 = require("./definitionProvider");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
// import * as path from 'path';
// Create a connection for the server
const connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
const documents = new vscode_languageserver_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
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
// flags to avoid trigger concurrent validations (compiling is slow)
let validatingDocument = false;
let validatingAllDocuments = false;
let packageDefaultDependenciesDirectory = 'lib';
let packageDefaultDependenciesContractsDirectory = 'src';
function validate(document) {
    try {
        validatingDocument = true;
        const uri = document.uri;
        const filePath = vscode_languageserver_1.Files.uriToFilePath(uri);
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
                    .compileSolidityDocumentAndGetDiagnosticErrors(filePath, documentText, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory);
                errors.forEach(errorItem => {
                    const uriCompileError = vscode_uri_1.URI.file(errorItem.fileName);
                    if (uriCompileError.toString() === uri) {
                        compileErrorDiagnostics.push(errorItem.diagnostic);
                    }
                });
            }
        }
        catch (e) {
            //let x = e;// gracefull catch
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
    completionItems = completionItems.concat(service.getAllCompletionItems2(packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory, document, textDocumentPosition.position));
    return completionItems;
});
connection.onDefinition((handler) => {
    const provider = new definitionProvider_1.SolidityDefinitionProvider(rootPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory);
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
            connection.console.info("Validating using the compiler selected: " + solcCompiler_1.compilerType[defaultCompiler]);
            validateAllDocuments();
        }).catch(reason => {
            connection.console.error("An error has occurred initialising the compiler selected " + solcCompiler_1.compilerType[defaultCompiler] + ", please check your settings, reverting to the embedded compiler. Error: " + reason);
            solcCompiler.initialiseAllCompilerSettings(compileUsingRemoteVersion, compileUsingLocalVersion, nodeModulePackage, solcCompiler_1.compilerType.embedded);
            solcCompiler.initialiseSelectedCompiler().then(() => {
                validateAllDocuments();
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
connection.onInitialize((result) => {
    rootPath = result.rootPath;
    solcCachePath = result.initializationOptions;
    solcCompiler = new solcCompiler_1.SolcCompiler(rootPath);
    solcCompiler.setSolcCache(solcCachePath);
    return {
        capabilities: {
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: ['.'],
            },
            definitionProvider: true,
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Full,
        },
    };
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