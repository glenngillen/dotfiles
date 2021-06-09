"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
class TerraformContentProvider {
    constructor() {
        this.onDidChangeEmitter = new vscode.EventEmitter();
        this.onDidChange = this.onDidChangeEmitter.event;
    }
    provideTextDocumentContent(uri) {
        const command = uri.path;
        let module = decodeURI(uri.query);
        module = vscode_1.Uri.parse(module).path;
        let plan = `Running terraform ${command} on ${module} ...\n`;
        return new Promise((resolve) => {
            utils_1.exec(`terraform ${command} -no-color -detailed-exitcode ${module}`).then((response) => {
                plan += response.stdout;
                plan += response.stderr;
                resolve(plan);
            }).catch(error => {
                resolve(error.message);
            });
        });
    }
}
exports.default = TerraformContentProvider;
TerraformContentProvider.scheme = 'terraform';
// lololol you're going to run it in the  terminal with a nice interface for adjusting the command to confirm
//# sourceMappingURL=terraformContentProvider.js.map