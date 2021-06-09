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
exports.TFCloudView = void 0;
const vscode = require("vscode");
const tfCloudClient_1 = require("./tfCloudClient");
const tfcRunsProvider_1 = require("./tfcRunsProvider");
const tfcWorkspacesProvider_1 = require("./tfcWorkspacesProvider");
class TFCloudView {
    constructor(context) {
        const client = new tfCloudClient_1.TFCloudClient();
        const runsProvider = new tfcRunsProvider_1.TfcRunsProvider();
        const workspacesProvider = new tfcWorkspacesProvider_1.TfcWorkspacesProvider();
        vscode.commands.registerCommand("tfc.connect", () => __awaiter(this, void 0, void 0, function* () {
            client.refresh().then(() => {
                vscode.window.registerTreeDataProvider("tfcRuns", runsProvider);
                vscode.window.registerTreeDataProvider("tfcWorkspaces", workspacesProvider);
                runsProvider.loadData(client);
                workspacesProvider.loadData(client);
            }).catch(() => {
                this.handleConnectionError();
            });
        }));
        vscode.commands.registerCommand("tfc.openLink", (link) => __awaiter(this, void 0, void 0, function* () {
            vscode.env.openExternal(vscode.Uri.parse(link));
        }));
        vscode.commands.registerCommand("tfc.refresh", () => __awaiter(this, void 0, void 0, function* () {
            client.refresh().then(() => {
                runsProvider.loadData(client);
                workspacesProvider.loadData(client);
            }).catch(() => {
                this.handleConnectionError();
            });
        }));
    }
    handleConnectionError() {
        vscode.window.showErrorMessage("Unable to connect to Terraform Cloud. You may need to log in.", "Run terraform login").then((selection) => {
            if (selection) {
                vscode.commands.executeCommand('terraform.login');
            }
        });
    }
}
exports.TFCloudView = TFCloudView;
//# sourceMappingURL=tfCloudView.js.map