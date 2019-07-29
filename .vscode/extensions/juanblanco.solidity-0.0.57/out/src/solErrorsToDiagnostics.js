'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
function getDiagnosticSeverity(severity) {
    switch (severity) {
        case 'error':
            return vscode_languageserver_1.DiagnosticSeverity.Error;
        case 'warning':
            return vscode_languageserver_1.DiagnosticSeverity.Warning;
        case 'info':
            return vscode_languageserver_1.DiagnosticSeverity.Information;
        default:
            return vscode_languageserver_1.DiagnosticSeverity.Error;
    }
}
exports.getDiagnosticSeverity = getDiagnosticSeverity;
function errorToDiagnostic(error) {
    const errorSplit = error.formattedMessage.split(':');
    let fileName = errorSplit[0];
    let index = 1;
    // a full path in windows includes a : for the drive
    if (process.platform === 'win32') {
        fileName = errorSplit[0] + ':' + errorSplit[1];
        index = 2;
    }
    // tslint:disable-next-line:radix
    const line = parseInt(errorSplit[index]);
    // tslint:disable-next-line:radix
    const column = parseInt(errorSplit[index + 1]);
    const severity = this.getDiagnosticSeverity(error.severity);
    const errorMessage = error.message;
    return {
        diagnostic: {
            message: errorMessage,
            range: {
                end: {
                    character: column + error.sourceLocation.end - error.sourceLocation.start - 1,
                    line: line - 1,
                },
                start: {
                    character: column - 1,
                    line: line - 1,
                },
            },
            severity: severity,
        },
        fileName: fileName,
    };
}
exports.errorToDiagnostic = errorToDiagnostic;
//# sourceMappingURL=solErrorsToDiagnostics.js.map