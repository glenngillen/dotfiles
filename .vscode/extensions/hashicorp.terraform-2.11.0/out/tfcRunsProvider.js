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
exports.TfcRunsProvider = void 0;
const vscode = require("vscode");
const path = require("path");
class TfcRunsProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getChildren(element) {
        if (!element) {
            return this.getRuns();
        }
    }
    getTreeItem(element) {
        return element;
    }
    loadData(client) {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = client;
            this.status = "initialized";
            this.refresh();
        });
    }
    getRuns() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status === "initialized") {
                const runs = yield this.client.runs();
                if (runs) {
                    return runs.map(r => this.toRun(r.message, r.workspaceName, r.status, r.statusTime, r.link));
                }
            }
            else {
                return [];
            }
        });
    }
    toRun(id, workspace, status, version, link) {
        return new Run(id, workspace, status, version, link);
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.TfcRunsProvider = TfcRunsProvider;
class Run extends vscode.TreeItem {
    constructor(label, workspace, status, version, link) {
        super(label);
        this.label = label;
        this.workspace = workspace;
        this.status = status;
        this.version = version;
        this.link = link;
        this.description = this.workspace;
        this.tooltip = this.version;
        this.command = { command: 'tfc.openLink', title: "Open in Terraform Cloud", arguments: [this.link] };
        this.iconPath = this.getIcon();
    }
    getIcon() {
        if (this.status === 'errored') {
            return {
                light: path.join(__filename, '..', '..', 'assets', 'error.svg'),
                dark: path.join(__filename, '..', '..', 'assets', 'error.svg')
            };
        }
        if (this.status === 'applied') {
            return {
                light: path.join(__filename, '..', '..', 'assets', 'done.svg'),
                dark: path.join(__filename, '..', '..', 'assets', 'done.svg')
            };
        }
        return {
            light: path.join(__filename, '..', '..', 'assets', 'default.svg'),
            dark: path.join(__filename, '..', '..', 'assets', 'default.svg')
        };
    }
}
//# sourceMappingURL=tfcRunsProvider.js.map