"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DiagnosticSeverity;
(function (DiagnosticSeverity) {
    DiagnosticSeverity[DiagnosticSeverity["ERROR"] = 0] = "ERROR";
    DiagnosticSeverity[DiagnosticSeverity["WARNING"] = 1] = "WARNING";
})(DiagnosticSeverity = exports.DiagnosticSeverity || (exports.DiagnosticSeverity = {}));
class Diagnostic {
    constructor(range, message, severity) {
        this.range = range;
        this.message = message;
        this.severity = severity;
    }
}
exports.Diagnostic = Diagnostic;

//# sourceMappingURL=diagnostic.js.map
