"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerraformPlanProvider = void 0;
const vscode = require("vscode");
const child_process_1 = require("child_process");
class TerraformPlanProvider {
    constructor() {
        this.onDidChangeEmitter = new vscode.EventEmitter();
        this.onDidChange = this.onDidChangeEmitter.event;
    }
    provideTextDocumentContent(uri) {
        const command = uri.authority;
        const module = uri.query;
        child_process_1.exec(`terraform ${command}`, { cwd: module }, (error, stdout, stderr) => {
            return stdout;
        });
        return;
    }
}
exports.TerraformPlanProvider = TerraformPlanProvider;
//# sourceMappingURL=terraformPlanProvider.js.map