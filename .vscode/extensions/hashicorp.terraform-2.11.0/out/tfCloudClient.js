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
exports.TFCloudClient = void 0;
const vscode = require("vscode");
const os_1 = require("os");
const utils_1 = require("./utils");
class TFCloudClient {
    constructor() {
        this.credentials = {};
        this._current_runs = [];
        this._workspaces = [];
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const homeDir = os_1.homedir();
                const login = yield vscode.workspace.fs.readFile(vscode.Uri.parse(`${homeDir}/.terraform.d/credentials.tfrc.json`));
                this.credentials = JSON.parse(login.toString()).credentials;
                const memberships = yield this.tfcRequest(`/organization-memberships`);
                const organizations = JSON.parse(memberships).data.map(m => m.relationships.organization.data.id);
                // TODO: have some kind of selector for multiple memberships -- or merge them?
                const response = yield this.tfcRequest(`/organizations/${organizations[0]}/workspaces?include=current_run`);
                this._workspaces = JSON.parse(response).data;
                this._current_runs = this._workspaces.map(w => w.relationships['current-run'].data).filter(r => r);
                return true;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    tfcRequest(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.credentials) {
                const source = Object.keys(this.credentials)[0];
                const uri = encodeURI(`https://${source}/api/v2${endpoint}`);
                const options = {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.credentials[source].token}`,
                        'Content-Type': 'application/vnd.api+json'
                    }
                };
                return utils_1.httpsRequest(uri, options);
            }
            else {
                return Promise.reject("No terraform credentials found");
            }
        });
    }
    runs(workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (workspaceId) {
                const response = yield this.tfcRequest(`/workspaces/${workspaceId}/runs?page[size]=3`);
                const runs = JSON.parse(response).data;
                return runs.map(run => {
                    const workspaceId = run.relationships.workspace.data.id;
                    return this.toRun(workspaceId, run);
                });
            }
            else {
                return Promise.all(this._current_runs.map(r => {
                    return this.tfcRequest(`/runs/${r.id}`);
                })).then((response) => {
                    const runs = response.map(r => JSON.parse(r));
                    return runs.map(r => {
                        const run = r.data;
                        const workspaceId = run.relationships.workspace.data.id;
                        return this.toRun(workspaceId, run);
                    });
                });
            }
        });
    }
    workspaces() {
        return this._workspaces.map(w => this.toWorkspace(w));
    }
    currentRun(workspace) {
        const run = workspace.relationships["latest-run"].data;
        return this.toRun(workspace.id, run);
    }
    toRun(workspaceId, run) {
        const id = run.id;
        const message = run.attributes.message;
        const status = run.attributes.status;
        const statusTime = run.attributes['status-timestamps'][`${status}-at`];
        const workspace = this._workspaces.find(w => w.id === workspaceId);
        const organization = workspace.relationships.organization.data.id;
        const workspaceName = workspace.attributes.name;
        const link = `https://app.terraform.io/app/${organization}/workspaces/${workspaceName}/runs/${id}`;
        return { workspaceName, id, message, status, statusTime, link };
    }
    toWorkspace(workspace) {
        const id = workspace.id;
        const name = workspace.attributes.name;
        const organization = workspace.relationships.organization.data.id;
        const link = `https://app.terraform.io/app/${organization}/workspaces/${name}/runs`;
        return { id, name, organization, link };
    }
}
exports.TFCloudClient = TFCloudClient;
//# sourceMappingURL=tfCloudClient.js.map