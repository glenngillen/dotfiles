'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const path = require("path");
const vscode = require("vscode");
const compileAll_1 = require("./compileAll");
const compiler_1 = require("./compiler");
const compileActive_1 = require("./compileActive");
const codegen_1 = require("./codegen");
const vscode_languageclient_1 = require("vscode-languageclient");
const soliumClientFixer_1 = require("./linter/soliumClientFixer");
// tslint:disable-next-line:no-duplicate-imports
const vscode_1 = require("vscode");
const prettierFormatter_1 = require("./formatter/prettierFormatter");
const solcCompiler_1 = require("./solcCompiler");
let diagnosticCollection;
let compiler;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const ws = vscode_1.workspace.workspaceFolders;
        diagnosticCollection = vscode.languages.createDiagnosticCollection('solidity');
        compiler = new compiler_1.Compiler(context.extensionPath);
        /*
        const configuration = vscode.workspace.getConfiguration('solidity');
        const cacheConfiguration = configuration.get<string>('solcCache');
        if (typeof cacheConfiguration === 'undefined' || cacheConfiguration === null) {
            configuration.update('solcCache', context.extensionPath, vscode.ConfigurationTarget.Global);
        }*/
        /* WSL is affected by this
        workspace.onDidChangeConfiguration(async (event) => {
            if (event.affectsConfiguration('solidity.enableLocalNodeCompiler') ||
                event.affectsConfiguration('solidity.compileUsingRemoteVersion') ||
                event.affectsConfiguration('solidity.compileUsingLocalVersion')) {
                await initialiseCompiler();
            }
        });
        */
        context.subscriptions.push(diagnosticCollection);
        compileActive_1.initDiagnosticCollection(diagnosticCollection);
        context.subscriptions.push(vscode.commands.registerCommand('solidity.compile.active', () => __awaiter(this, void 0, void 0, function* () {
            const compiledResults = yield compileActive_1.compileActiveContract(compiler);
            codegen_1.autoCodeGenerateAfterCompilation(compiledResults, null, diagnosticCollection);
            return compiledResults;
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.compile.activeUsingRemote', () => __awaiter(this, void 0, void 0, function* () {
            const compiledResults = yield compileActive_1.compileActiveContract(compiler, solcCompiler_1.compilerType.remote);
            codegen_1.autoCodeGenerateAfterCompilation(compiledResults, null, diagnosticCollection);
            return compiledResults;
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.compile.activeUsingLocalFile', () => __awaiter(this, void 0, void 0, function* () {
            const compiledResults = yield compileActive_1.compileActiveContract(compiler, solcCompiler_1.compilerType.localFile);
            codegen_1.autoCodeGenerateAfterCompilation(compiledResults, null, diagnosticCollection);
            return compiledResults;
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.compile.activeUsingNodeModule', () => __awaiter(this, void 0, void 0, function* () {
            const compiledResults = yield compileActive_1.compileActiveContract(compiler, solcCompiler_1.compilerType.localNodeModule);
            codegen_1.autoCodeGenerateAfterCompilation(compiledResults, null, diagnosticCollection);
            return compiledResults;
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.compile', () => {
            compileAll_1.compileAllContracts(compiler, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenCSharpProject', (args) => {
            codegen_1.codeGenerateNethereumCQSCsharp(args, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.compileAndCodegenCSharpProject', (args) => __awaiter(this, void 0, void 0, function* () {
            const compiledResults = yield compileActive_1.compileActiveContract(compiler);
            compiledResults.forEach(file => {
                codegen_1.codeGenerateCQS(file, 0, args, diagnosticCollection);
            });
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenNethereumCodeGenSettings', (args) => {
            codegen_1.generateNethereumCodeSettingsFile();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenVbNetProject', (args) => {
            codegen_1.codeGenerateNethereumCQSVbNet(args, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.compileAndCodegenVbNetProject', (args) => __awaiter(this, void 0, void 0, function* () {
            const compiledResults = yield compileActive_1.compileActiveContract(compiler);
            compiledResults.forEach(file => {
                codegen_1.codeGenerateCQS(file, 1, args, diagnosticCollection);
            });
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenFSharpProject', (args) => {
            codegen_1.codeGenerateNethereumCQSFSharp(args, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.compileAndCodegenFSharpProject', (args) => __awaiter(this, void 0, void 0, function* () {
            const compiledResults = yield compileActive_1.compileActiveContract(compiler);
            compiledResults.forEach(file => {
                codegen_1.codeGenerateCQS(file, 3, args, diagnosticCollection);
            });
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenCSharpProjectAll', (args) => {
            codegen_1.codeGenerateNethereumCQSCSharpAll(args, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenVbNetProjectAll', (args) => {
            codegen_1.codeGenerateNethereumCQSVbAll(args, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenFSharpProjectAll', (args) => {
            codegen_1.codeGenerateNethereumCQSFSharpAll(args, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenCSharpProjectAllAbiCurrent', (args) => {
            codegen_1.codeGenerateAllFilesFromAbiInCurrentFolder(0, args, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenVbNetProjectAllAbiCurrent', (args) => {
            codegen_1.codeGenerateAllFilesFromAbiInCurrentFolder(1, args, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.codegenFSharpProjectAllAbiCurrent', (args) => {
            codegen_1.codeGenerateAllFilesFromAbiInCurrentFolder(3, args, diagnosticCollection);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.fixDocument', () => {
            soliumClientFixer_1.lintAndfixCurrentDocument();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.compilerInfo', () => __awaiter(this, void 0, void 0, function* () {
            yield compiler.outputCompilerInfoEnsuringInitialised();
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.solcReleases', () => __awaiter(this, void 0, void 0, function* () {
            compiler.outputSolcReleases();
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.selectWorkspaceRemoteSolcVersion', () => __awaiter(this, void 0, void 0, function* () {
            compiler.selectRemoteVersion(vscode.ConfigurationTarget.Workspace);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.downloadRemoteSolcVersion', () => __awaiter(this, void 0, void 0, function* () {
            const root = vscode.workspace.workspaceFolders[0];
            compiler.downloadRemoteVersion(root.uri.fsPath);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.downloadRemoteVersionAndSetLocalPathSetting', () => __awaiter(this, void 0, void 0, function* () {
            const root = vscode.workspace.workspaceFolders[0];
            compiler.downloadRemoteVersionAndSetLocalPathSetting(vscode.ConfigurationTarget.Workspace, root.uri.fsPath);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.selectGlobalRemoteSolcVersion', () => __awaiter(this, void 0, void 0, function* () {
            compiler.selectRemoteVersion(vscode.ConfigurationTarget.Global);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('solidity.changeDefaultCompilerType', () => __awaiter(this, void 0, void 0, function* () {
            compiler.changeDefaultCompilerType(vscode.ConfigurationTarget.Workspace);
        })));
        context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('solidity', {
            provideDocumentFormattingEdits(document) {
                return prettierFormatter_1.formatDocument(document, context);
            },
        }));
        const serverModule = path.join(__dirname, 'server.js');
        const serverOptions = {
            debug: {
                module: serverModule,
                options: {
                    execArgv: ['--nolazy', '--inspect=6009'],
                },
                transport: vscode_languageclient_1.TransportKind.ipc,
            },
            run: {
                module: serverModule,
                transport: vscode_languageclient_1.TransportKind.ipc,
            },
        };
        const clientOptions = {
            documentSelector: [
                { language: 'solidity', scheme: 'file' },
                { language: 'solidity', scheme: 'untitled' },
            ],
            revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
            synchronize: {
                // Synchronize the setting section 'solidity' to the server
                configurationSection: 'solidity',
            },
            initializationOptions: context.extensionPath,
        };
        let clientDisposable;
        if (ws) {
            clientDisposable = new vscode_languageclient_1.LanguageClient('solidity', 'Solidity Language Server', serverOptions, clientOptions).start();
        }
        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        context.subscriptions.push(clientDisposable);
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map