'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const solcCompiler_1 = require("./solcCompiler");
const solhint_1 = require("./linter/solhint");
const solium_1 = require("./linter/solium");
const completionService_1 = require("./completionService");
const definitionProvider_1 = require("./definitionProvider");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
// import * as path from 'path';
// Create a connection for the server
const connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
const documents = new vscode_languageserver_1.TextDocuments();
let rootPath;
let solcCompiler;
let linter = null;
let enabledAsYouTypeErrorCheck = false;
let compileUsingRemoteVersion = '';
let compileUsingLocalVersion = '';
let solhintDefaultRules = {};
let soliumDefaultRules = {};
let validationDelay = 1500;
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
                    const uriCompileError = vscode_uri_1.default.file(errorItem.fileName);
                    if (uriCompileError.toString() === uri) {
                        compileErrorDiagnostics.push(errorItem.diagnostic);
                    }
                });
            }
        }
        catch (_b) {
            // gracefull catch
        }
        const diagnostics = linterDiagnostics.concat(compileErrorDiagnostics);
        console.log(uri);
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
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items
    let completionItems = [];
    try {
        const document = documents.get(textDocumentPosition.textDocument.uri);
        const documentPath = vscode_languageserver_1.Files.uriToFilePath(textDocumentPosition.textDocument.uri);
        const documentText = document.getText();
        const lines = documentText.split(/\r?\n/g);
        const position = textDocumentPosition.position;
        let start = 0;
        let triggeredByDot = false;
        for (let i = position.character; i >= 0; i--) {
            if (lines[position.line[i]] === ' ') {
                triggeredByDot = false;
                i = 0;
                start = 0;
            }
            if (lines[position.line][i] === '.') {
                start = i;
                i = 0;
                triggeredByDot = true;
            }
        }
        if (triggeredByDot) {
            const globalVariableContext = completionService_1.GetContextualAutoCompleteByGlobalVariable(lines[position.line], start);
            if (globalVariableContext != null) {
                completionItems = completionItems.concat(globalVariableContext);
            }
            return completionItems;
        }
        const service = new completionService_1.CompletionService(rootPath);
        completionItems = completionItems.concat(service.getAllCompletionItems(documentText, documentPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory));
    }
    catch (error) {
        // graceful catch
        // console.log(error);
    }
    finally {
        completionItems = completionItems.concat(completionService_1.GetCompletionTypes());
        completionItems = completionItems.concat(completionService_1.GetCompletionKeywords());
        completionItems = completionItems.concat(completionService_1.GeCompletionUnits());
        completionItems = completionItems.concat(completionService_1.GetGlobalFunctions());
        completionItems = completionItems.concat(completionService_1.GetGlobalVariables());
    }
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
        solcCompiler.intialiseCompiler(compileUsingLocalVersion, compileUsingRemoteVersion).then(() => {
            validateAllDocuments();
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
    solcCompiler = new solcCompiler_1.SolcCompiler(rootPath);
    return {
        capabilities: {
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: ['.'],
            },
            definitionProvider: true,
            textDocumentSync: documents.syncKind,
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
    const enabledSolium = settings.enabledSolium;
    if (enabledSolium) {
        return 'solium';
    }
    else {
        return settings.linter;
    }
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