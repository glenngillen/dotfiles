'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const solErrorsToDiagnostics_1 = require("./solErrorsToDiagnostics");
const vscode_languageserver_1 = require("vscode-languageserver");
function errorsToDiagnostics(diagnosticCollection, errors) {
    const errorWarningCounts = { errors: 0, warnings: 0 };
    const diagnosticMap = new Map();
    errors.forEach(error => {
        const { diagnostic, fileName } = solErrorsToDiagnostics_1.errorToDiagnostic(error);
        const targetUri = vscode.Uri.file(fileName);
        let diagnostics = diagnosticMap.get(targetUri);
        if (!diagnostics) {
            diagnostics = [];
        }
        diagnostics.push(diagnostic);
        diagnosticMap.set(targetUri, diagnostics);
    });
    const entries = [];
    diagnosticMap.forEach((diags, uri) => {
        errorWarningCounts.errors += diags.filter((diagnostic) => diagnostic.severity === vscode_languageserver_1.DiagnosticSeverity.Error).length;
        errorWarningCounts.warnings += diags.filter((diagnostic) => diagnostic.severity === vscode_languageserver_1.DiagnosticSeverity.Warning).length;
        entries.push([uri, diags]);
    });
    diagnosticCollection.set(entries);
    return errorWarningCounts;
}
exports.errorsToDiagnostics = errorsToDiagnostics;
//# sourceMappingURL=solErrorsToDiaganosticsClient.js.map