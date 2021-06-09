"use strict";
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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const node_1 = require("vscode-languageclient/node");
const path = require("path");
const short_unique_id_1 = require("short-unique-id");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
const languageServerInstaller_1 = require("./languageServerInstaller");
const vscodeUtils_1 = require("./vscodeUtils");
const utils_1 = require("./utils");
const clients = new Map();
const shortUid = new short_unique_id_1.default();
const terraformStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
// Telemetry config
const extensionId = 'hashicorp.terraform';
const appInsightsKey = '885372d2-6f3c-499f-9d25-b8b219983a52';
let reporter;
let installPath;
let languageServerUpdater = new utils_1.SingleInstanceTimeout();
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionVersion = vscode.extensions.getExtension(extensionId).packageJSON.version;
        reporter = new vscode_extension_telemetry_1.default(extensionId, extensionVersion, appInsightsKey);
        context.subscriptions.push(reporter);
        installPath = path.join(context.extensionPath, 'lsp');
        // get rid of pre-2.0.0 settings
        if (vscodeUtils_1.config('terraform').has('languageServer.enabled')) {
            try {
                yield vscodeUtils_1.config('terraform').update('languageServer', { enabled: undefined, external: true }, vscode.ConfigurationTarget.Global);
            }
            catch (err) {
                console.error(`Error trying to erase pre-2.0.0 settings: ${err.message}`);
            }
        }
        // Subscriptions
        context.subscriptions.push(vscode.commands.registerCommand('terraform.enableLanguageServer', () => __awaiter(this, void 0, void 0, function* () {
            if (!enabled()) {
                const current = vscodeUtils_1.config('terraform').get('languageServer');
                yield vscodeUtils_1.config('terraform').update('languageServer', Object.assign(current, { external: true }), vscode.ConfigurationTarget.Global);
            }
            return updateLanguageServer();
        })), vscode.commands.registerCommand('terraform.disableLanguageServer', () => __awaiter(this, void 0, void 0, function* () {
            if (enabled()) {
                const current = vscodeUtils_1.config('terraform').get('languageServer');
                yield vscodeUtils_1.config('terraform').update('languageServer', Object.assign(current, { external: false }), vscode.ConfigurationTarget.Global);
            }
            languageServerUpdater.clear();
            return stopClients();
        })), vscode.commands.registerCommand('terraform.apply', () => __awaiter(this, void 0, void 0, function* () {
            yield terraformCommand('apply', false);
        })), vscode.commands.registerCommand('terraform.init', () => __awaiter(this, void 0, void 0, function* () {
            const selected = yield vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                defaultUri: vscode.workspace.workspaceFolders[0].uri,
                openLabel: "Initialize"
            });
            if (selected) {
                const moduleUri = selected[0];
                const client = getDocumentClient(moduleUri);
                const requestParams = { command: `${client.commandPrefix}.terraform-ls.terraform.init`, arguments: [`uri=${moduleUri}`] };
                yield execWorkspaceCommand(client.client, requestParams);
            }
        })), vscode.commands.registerCommand('terraform.initCurrent', () => __awaiter(this, void 0, void 0, function* () {
            yield terraformCommand('init');
        })), vscode.commands.registerCommand('terraform.plan', () => __awaiter(this, void 0, void 0, function* () {
            yield terraformCommand('plan', false);
        })), vscode.commands.registerCommand('terraform.validate', () => __awaiter(this, void 0, void 0, function* () {
            yield terraformCommand('validate');
        })), vscode.workspace.onDidChangeConfiguration((event) => __awaiter(this, void 0, void 0, function* () {
            if (event.affectsConfiguration('terraform') || event.affectsConfiguration('terraform-ls')) {
                const reloadMsg = 'Reload VSCode window to apply language server changes';
                const selected = yield vscode.window.showInformationMessage(reloadMsg, 'Reload');
                if (selected === 'Reload') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            }
        })), vscode.workspace.onDidChangeWorkspaceFolders((event) => __awaiter(this, void 0, void 0, function* () {
            if (event.removed.length > 0) {
                yield stopClients(vscodeUtils_1.prunedFolderNames(event.removed));
            }
            if (event.added.length > 0) {
                yield startClients(vscodeUtils_1.prunedFolderNames(event.added));
            }
        })), vscode.window.onDidChangeActiveTextEditor((event) => __awaiter(this, void 0, void 0, function* () {
            // Make sure there's an open document in a folder
            // Also check whether they're running a different language server
            if (event && vscode.workspace.workspaceFolders[0] && !vscodeUtils_1.config('terraform').get('languageServer.pathToBinary')) {
                const documentUri = event.document.uri;
                const client = getDocumentClient(documentUri);
                if (client) {
                    try {
                        const response = yield rootModules(client, documentUri.toString());
                        if (response.needsInit === false) {
                            terraformStatus.text = `$(refresh) ${response.rootModules[0].name}`;
                            terraformStatus.color = new vscode.ThemeColor('statusBar.foreground');
                            terraformStatus.tooltip = `Click to run terraform init`;
                            terraformStatus.command = "terraform.initCurrent";
                            terraformStatus.show();
                        }
                        else {
                            terraformStatus.hide();
                        }
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(err);
                        reporter.sendTelemetryException(err);
                        terraformStatus.hide();
                    }
                }
            }
        })));
        if (enabled()) {
            try {
                yield vscode.commands.executeCommand('terraform.enableLanguageServer');
            }
            catch (error) {
                reporter.sendTelemetryException(error);
            }
        }
        // export public API
        return { getDocumentClient, rootModules };
    });
}
exports.activate = activate;
function deactivate() {
    return stopClients();
}
exports.deactivate = deactivate;
function updateLanguageServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const delay = 1000 * 60 * 60 * 24;
        languageServerUpdater.timeout(updateLanguageServer, delay); // check for new updates every 24hrs
        // skip install if a language server binary path is set
        if (!vscodeUtils_1.config('terraform').get('languageServer.pathToBinary')) {
            const installer = new languageServerInstaller_1.LanguageServerInstaller(installPath, reporter);
            const install = yield installer.needsInstall();
            if (install) {
                yield stopClients();
                try {
                    yield installer.install();
                }
                catch (err) {
                    console.log(err); // for test failure reporting
                    reporter.sendTelemetryException(err);
                    throw err;
                }
                finally {
                    yield installer.cleanupZips();
                }
            }
        }
        return startClients(); // on repeat runs with no install, this will be a no-op
    });
}
function startClients(folders = vscodeUtils_1.prunedFolderNames()) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting:', folders);
        const command = yield pathToBinary();
        const disposables = [];
        for (const folder of folders) {
            if (!clients.has(folder)) {
                const commandPrefix = shortUid.seq();
                const client = newClient(command, folder, commandPrefix);
                client.onReady().then(() => {
                    reporter.sendTelemetryEvent('startClient');
                });
                client.onDidChangeState((event) => {
                    if (event.newState === node_1.State.Stopped) {
                        clients.delete(folder);
                        reporter.sendTelemetryEvent('stopClient');
                    }
                });
                disposables.push(client.start());
                clients.set(folder, { commandPrefix, client });
            }
            else {
                console.log(`Client for folder: ${folder} already started`);
            }
        }
        return disposables;
    });
}
function newClient(cmd, location, commandPrefix) {
    const binaryName = cmd.split('/').pop();
    const channelName = `${binaryName}: ${location}`;
    const f = vscodeUtils_1.getWorkspaceFolder(location);
    const serverArgs = vscodeUtils_1.config('terraform').get('languageServer.args');
    const rootModulePaths = vscodeUtils_1.config('terraform-ls', f).get('rootModules');
    const excludeModulePaths = vscodeUtils_1.config('terraform-ls', f).get('excludeRootModules');
    const experimentalFeatures = vscodeUtils_1.config('terraform-ls').get('experimentalFeatures');
    if (rootModulePaths.length > 0 && excludeModulePaths.length > 0) {
        throw new Error('Only one of rootModules and excludeRootModules can be set at the same time, please remove the conflicting config and reload');
    }
    let initializationOptions = { commandPrefix, experimentalFeatures };
    if (rootModulePaths.length > 0) {
        initializationOptions = Object.assign(initializationOptions, { rootModulePaths });
    }
    if (excludeModulePaths.length > 0) {
        initializationOptions = Object.assign(initializationOptions, { excludeModulePaths });
    }
    const setup = vscode.window.createOutputChannel(channelName);
    setup.appendLine(`Launching language server: ${cmd} ${serverArgs.join(' ')} for folder: ${location}`);
    const executable = {
        command: cmd,
        args: serverArgs,
        options: {}
    };
    const serverOptions = {
        run: executable,
        debug: executable
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'terraform', pattern: `${f.uri.fsPath}/**/*` }],
        workspaceFolder: f,
        initializationOptions: initializationOptions,
        initializationFailedHandler: (error) => {
            reporter.sendTelemetryException(error);
            return false;
        },
        outputChannel: setup,
        revealOutputChannelOn: 4 // hide always
    };
    return new node_1.LanguageClient(`languageServer/${location}`, `Language Server: ${location}`, serverOptions, clientOptions);
}
function stopClients(folders = vscodeUtils_1.prunedFolderNames()) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Stopping:', folders);
        const promises = [];
        for (const folder of folders) {
            if (clients.has(folder)) {
                promises.push(clients.get(folder).client.stop());
            }
            else {
                console.log(`Attempted to stop a client for folder: ${folder} but no client exists`);
            }
        }
        return Promise.all(promises);
    });
}
let _pathToBinaryPromise;
function pathToBinary() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_pathToBinaryPromise) {
            let command = vscodeUtils_1.config('terraform').get('languageServer.pathToBinary');
            if (command) { // Skip install/upgrade if user has set custom binary path
                reporter.sendTelemetryEvent('usePathToBinary');
            }
            else {
                command = path.join(installPath, 'terraform-ls');
            }
            _pathToBinaryPromise = Promise.resolve(command);
        }
        return _pathToBinaryPromise;
    });
}
function clientName(folderName, workspaceFolders = vscodeUtils_1.sortedWorkspaceFolders()) {
    folderName = vscodeUtils_1.normalizeFolderName(folderName);
    const outerFolder = workspaceFolders.find(element => folderName.startsWith(element));
    // If this folder isn't nested, the found item will be itself
    if (outerFolder && (outerFolder !== folderName)) {
        folderName = vscodeUtils_1.getFolderName(vscodeUtils_1.getWorkspaceFolder(outerFolder));
    }
    return folderName;
}
function getDocumentClient(document) {
    return clients.get(clientName(document.toString()));
}
function execWorkspaceCommand(client, params) {
    reporter.sendTelemetryEvent('execWorkspaceCommand', { command: params.command });
    return client.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, params);
}
function rootModulesCommand(languageClient, documentUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestParams = { command: `${languageClient.commandPrefix}.terraform-ls.rootmodules`, arguments: [`uri=${documentUri}`] };
        return execWorkspaceCommand(languageClient.client, requestParams);
    });
}
function rootModules(languageClient, documentUri) {
    return __awaiter(this, void 0, void 0, function* () {
        let doneLoading = false;
        let rootModules;
        for (let attempt = 0; attempt < 5 && !doneLoading; attempt++) {
            const response = yield rootModulesCommand(languageClient, documentUri);
            doneLoading = response.doneLoading;
            rootModules = response.rootModules;
            if (!doneLoading) {
                yield utils_1.sleep(100);
            }
        }
        if (!doneLoading) {
            throw new Error(`Unable to load root modules for ${documentUri}`);
        }
        return { rootModules: rootModules, needsInit: rootModules.length === 0 };
    });
}
function terraformCommand(command, languageServerExec = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (vscode.window.activeTextEditor) {
            const documentUri = vscode.window.activeTextEditor.document.uri;
            const languageClient = getDocumentClient(documentUri);
            const modules = yield rootModules(languageClient, documentUri.toString());
            let selectedModule;
            if (modules.rootModules.length > 1) {
                const selected = yield vscode.window.showQuickPick(modules.rootModules.map(m => m.uri), { canPickMany: false });
                selectedModule = selected[0];
            }
            else {
                selectedModule = modules.rootModules[0].uri;
            }
            if (languageServerExec) {
                const requestParams = { command: `${languageClient.commandPrefix}.terraform-ls.terraform.${command}`, arguments: [`uri=${selectedModule}`] };
                return execWorkspaceCommand(languageClient.client, requestParams);
            }
            else {
                const terminalName = `Terraform ${selectedModule}`;
                const moduleURI = vscode.Uri.parse(selectedModule);
                const terraformCommand = yield vscode.window.showInputBox({ value: `terraform ${command}`, prompt: `Run in ${selectedModule}` });
                if (terraformCommand) {
                    const terminal = vscode.window.terminals.find(t => t.name == terminalName) ||
                        vscode.window.createTerminal({ name: `Terraform ${selectedModule}`, cwd: moduleURI });
                    terminal.sendText(terraformCommand);
                    terminal.show();
                }
                return;
            }
        }
        else {
            vscode.window.showWarningMessage(`Open a module then run terraform ${command} again`);
            return;
        }
    });
}
function enabled() {
    return vscodeUtils_1.config('terraform').get('languageServer.external');
}
//# sourceMappingURL=extension.js.map