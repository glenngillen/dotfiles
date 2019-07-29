"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function getConfiguration() {
    let raw = vscode.workspace.getConfiguration("terraform");
    // needed for conversion
    let convertible = {
        path: raw.path,
        paths: raw.paths,
        templateDirectory: raw.templateDirectory,
        lintPath: raw.lintPath,
        lintConfig: raw.lintConfig,
        indexing: raw.indexing,
        codelens: raw.codelens,
        telemetry: raw.telemetry,
        format: raw.format,
    };
    return convertible;
}
exports.getConfiguration = getConfiguration;

//# sourceMappingURL=configuration.js.map
