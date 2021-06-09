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
exports.TfcWorkspacesProvider = void 0;
const vscode = require("vscode");
const path = require("path");
class TfcWorkspacesProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getChildren(element) {
        if (!element) {
            return this.getWorkspaces();
        }
        else if (element.type === "workspaces") {
            return this.getRuns(this.workspaceId(element.name));
        }
    }
    getTreeItem(element) {
        return {
            label: element.name,
            collapsibleState: element.type === "workspaces" ?
                vscode.TreeItemCollapsibleState.Collapsed :
                vscode.TreeItemCollapsibleState.None,
            description: element.description,
            tooltip: element.tooltip,
            command: { command: 'tfc.openLink', title: "Open in Terraform Cloud", arguments: [element.link] },
            iconPath: element.iconPath
        };
    }
    loadData(client) {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = client;
            this.status = "initialized";
            this.refresh();
        });
    }
    getWorkspaces() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status === "initialized") {
                return this.client.workspaces().map(w => this.toWorkspace(w.name, "workspaces", w.organization, w.link));
            }
            else {
                return [];
            }
        });
    }
    workspaceId(workspaceName) {
        return this.client.workspaces().find(w => w.name === workspaceName).id;
    }
    toWorkspace(name, type, organization, link) {
        return new Workspace(name, type, link, organization);
    }
    getRuns(workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status === "initialized") {
                const runs = yield this.client.runs(workspaceId);
                if (runs) {
                    return runs.map(r => this.toRun(r.message, "runs", r.status, r.statusTime, r.link));
                }
            }
            else {
                return [];
            }
        });
    }
    toRun(name, type, link, status, version) {
        return new Run(name, type, link, status, version);
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.TfcWorkspacesProvider = TfcWorkspacesProvider;
class WorkspaceItem {
    constructor(name, type, link) {
        this.name = name;
        this.type = type;
        this.link = link;
    }
    get description() {
        return null;
    }
    get iconPath() {
        return null;
    }
    get tooltip() {
        return null;
    }
}
class Run extends WorkspaceItem {
    constructor(name, type, link, status, version) {
        super(name, type, link);
        this.name = name;
        this.type = type;
        this.link = link;
        this.status = status;
        this.version = version;
    }
    get tooltip() {
        return this.version;
    }
    get iconPath() {
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
class Workspace extends WorkspaceItem {
    constructor(name, type, link, organization) {
        super(name, type, link);
        this.name = name;
        this.type = type;
        this.link = link;
        this.organization = organization;
    }
    get description() {
        return this.organization;
    }
    get command() {
        return { command: 'tfc.openLink', arguments: [], title: "" };
    }
}
//# sourceMappingURL=tfcWorkspacesProvider.js.map