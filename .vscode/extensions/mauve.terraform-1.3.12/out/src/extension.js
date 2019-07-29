"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const completion_provider_1 = require("./autocompletion/completion-provider");
const codelense_1 = require("./codelense");
const commands_1 = require("./commands");
const command_1 = require("./commands/command");
const lint_1 = require("./commands/lint");
const navigatetosection_1 = require("./commands/navigatetosection");
const plan_1 = require("./commands/plan");
const preview_1 = require("./commands/preview");
const reindex_1 = require("./commands/reindex");
const showreferences_1 = require("./commands/showreferences");
const validate_1 = require("./commands/validate");
const configuration_1 = require("./configuration");
const definition_1 = require("./definition");
const documentlink_1 = require("./documentlink");
const folding_1 = require("./folding");
const format_1 = require("./format");
const hover_1 = require("./hover");
const index_1 = require("./index");
const crawler_1 = require("./index/crawler");
const index_adapter_1 = require("./index/index-adapter");
const providers_1 = require("./index/providers");
const live_1 = require("./live");
const logging = require("./logger");
const rename_1 = require("./rename");
const runner_1 = require("./runner");
const telemetry = require("./telemetry");
const module_overview_1 = require("./views/module-overview");
exports.outputChannel = vscode.window.createOutputChannel("Terraform");
const logger = new logging.Logger("extension");
const documentSelector = [
    { language: "terraform", scheme: "file" },
    { language: "terraform", scheme: "untitled" }
];
function activate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const start = process.hrtime();
        let indexAdapter = new index_adapter_1.IndexAdapter(new index_1.Index, configuration_1.getConfiguration().indexing.exclude || []);
        ctx.subscriptions.push(indexAdapter);
        telemetry.activate(ctx);
        logging.configure(exports.outputChannel);
        let runner = yield runner_1.Runner.create();
        let formattingProvider = new format_1.FormattingEditProvider(runner);
        ctx.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(documentSelector, formattingProvider));
        let watcher;
        if (vscode.workspace.rootPath && configuration_1.getConfiguration().indexing.enabled) {
            watcher = new crawler_1.FileSystemWatcher(indexAdapter);
            ctx.subscriptions.push(watcher);
        }
        ctx.subscriptions.push(
        // push
        new validate_1.ValidateCommand(indexAdapter, runner, ctx), new lint_1.LintCommand(ctx), new reindex_1.ReindexCommand(indexAdapter, watcher, ctx), new showreferences_1.ShowReferencesCommand(indexAdapter, ctx), new commands_1.IndexCommand(indexAdapter, ctx), new preview_1.PreviewGraphCommand(indexAdapter, runner, ctx), new navigatetosection_1.NavigateToSectionCommand(indexAdapter, ctx), new plan_1.PlanCommand(runner, indexAdapter, ctx), 
        // providers
        vscode.languages.registerCompletionItemProvider(documentSelector, new completion_provider_1.CompletionProvider(indexAdapter), '.', '"', '{', '(', '['), vscode.languages.registerDefinitionProvider(documentSelector, new definition_1.DefinitionProvider(indexAdapter)), vscode.languages.registerDocumentSymbolProvider(documentSelector, new providers_1.DocumentSymbolProvider(indexAdapter)), vscode.languages.registerWorkspaceSymbolProvider(new providers_1.WorkspaceSymbolProvider(indexAdapter)), vscode.languages.registerReferenceProvider(documentSelector, new providers_1.ReferenceProvider(indexAdapter)), vscode.languages.registerRenameProvider(documentSelector, new rename_1.RenameProvider(indexAdapter)), vscode.languages.registerHoverProvider(documentSelector, new hover_1.HoverProvider(indexAdapter)), vscode.languages.registerDocumentLinkProvider(documentSelector, new documentlink_1.DocumentLinkProvider(indexAdapter)), vscode.languages.registerFoldingRangeProvider(documentSelector, new folding_1.CodeFoldingProvider(indexAdapter)), 
        // views
        vscode.window.registerTreeDataProvider('terraform-modules', new module_overview_1.ModuleOverview(indexAdapter)));
        if (configuration_1.getConfiguration().codelens.enabled) {
            ctx.subscriptions.push(vscode.languages.registerCodeLensProvider(documentSelector, new codelense_1.CodeLensProvider(indexAdapter)));
        }
        // operations which should only work in a local context (as opposed to live-share)
        if (vscode.workspace.rootPath) {
            ctx.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => live_1.liveIndex(indexAdapter, e)));
            // start to build the index
            if (watcher) {
                yield watcher.crawl();
            }
        }
        const elapsed = process.hrtime(start);
        const elapsedMs = elapsed[0] * 1e3 + elapsed[1] / 1e6;
        telemetry.Reporter.trackEvent('activated', {}, { activateTimeMs: elapsedMs });
        // show a warning if erd0s.terraform-autocomplete is installed as it is
        // known to cause issues with this plugin
        if (vscode.extensions.getExtension('erd0s.terraform-autocomplete')) {
            const message = "The extension erd0s.terraform-autocomplete is known to cause issues with the Terraform plugin\n" +
                "please refer to https://github.com/mauve/vscode-terraform/issues/102 for more information.";
            vscode.window.showInformationMessage(message);
            logger.error(message);
        }
        // validate if package.json contains commands which have not been registered
        const packageJson = require(ctx.asAbsolutePath('./package.json'));
        const commands = packageJson.contributes.commands;
        for (const cmd of commands) {
            if (command_1.Command.RegisteredCommands.indexOf(cmd.command) === -1) {
                throw new Error(`Command ${cmd.command} (${cmd.title}) not registered`);
            }
        }
    });
}
exports.activate = activate;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        logging.configure(null);
        return yield telemetry.deactivate();
    });
}
exports.deactivate = deactivate;

//# sourceMappingURL=extension.js.map
