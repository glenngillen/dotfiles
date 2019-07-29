'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require('path');
const utils_1 = require("./utils");
function activate(context) {
    console.log('Congratulations, your extension "webpack" is now active!');
    const disposable = vscode.commands.registerCommand('extension.createConfig', () => {
        const rootPath = vscode.workspace.rootPath;
        // if a folder is not open, then bail.
        if (!rootPath) {
            vscode.window.showErrorMessage('Please open a folder before generating a webpack file');
        }
        const webPackPath = path.join(rootPath, 'webpack.config.js');
        if (utils_1.checkExists(webPackPath)) {
            return vscode.window.showInformationMessage('Webpack config already exists.');
        }
        const webPackConfig = utils_1.formatCode(utils_1.getWebpackConfig()); // get the webpack config
        const isDevDepsUpdated = utils_1.updateDevDependencies(); // update dev deps
        if (utils_1.createFile(webPackPath, webPackConfig) && isDevDepsUpdated) { // if written and updated
            return vscode.window.showInformationMessage('Webpack config created and dependencies update. Please run npm install');
        }
        return vscode.window.showErrorMessage('Something went wrong, please try again.');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    console.log('Webpack ext deactived.');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map