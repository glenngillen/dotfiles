"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const child_process_1 = require("child_process");
class TerraformContentProvider {
    constructor() {
        this.onDidChangeEmitter = new vscode.EventEmitter();
        this.onDidChange = this.onDidChangeEmitter.event;
    }
    provideTextDocumentContent(uri) {
        const command = uri.authority;
        const module = uri.query;
        child_process_1.exec(`terraform ${command}`, { cwd: module }, (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
            return stderr || stdout;
        });
        return;
    }
}
exports.default = TerraformContentProvider;
TerraformContentProvider.scheme = 'terraform';
//# sourceMappingURL=terraformCommandProvider.js.map