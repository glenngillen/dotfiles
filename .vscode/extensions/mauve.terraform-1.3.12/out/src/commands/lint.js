"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const vscode = require("vscode");
const command_1 = require("./command");
class LintCommand extends command_1.Command {
    constructor(ctx) {
        super("lint", ctx, command_1.CommandType.PALETTE);
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const configuration = vscode.workspace.getConfiguration("terraform");
            if (vscode.workspace.workspaceFolders === undefined) {
                return yield vscode.window.showWarningMessage("terraform.lint can only be used when opening a folder");
            }
            exports.LintDiagnosticsCollection.clear();
            let success = true;
            for (const workspaceFolder of vscode.workspace.workspaceFolders) {
                if (workspaceFolder.uri.scheme !== "file") {
                    this.logger.warn(`Ignoring workspace folder ${workspaceFolder.name} with uri ${workspaceFolder.uri.toString()}, unsupported scheme.`);
                    continue;
                }
                const workspaceDir = workspaceFolder.uri.fsPath;
                try {
                    const issues = yield lint(configuration["lintPath"], configuration["lintConfig"], workspaceDir);
                    this.logger.info(`${issues.length} issues`);
                    this.groupIssues(issues).forEach((diagnostics, file) => {
                        this.logger.info(`${file}: ${diagnostics.length} issues`);
                        exports.LintDiagnosticsCollection.set(vscode.Uri.file(`${workspaceDir}/${file}`), diagnostics);
                    });
                }
                catch (error) {
                    this.logger.exception(`Linting failed for ${workspaceDir}`, error);
                    success = false;
                }
            }
            if (!success) {
                return yield vscode.window.showErrorMessage("Linting failed, more information in the output tab.");
            }
        });
    }
    groupIssues(issues) {
        let issuesByFile = new Map();
        issues
            .forEach((issue) => {
            let diagnostic = toDiagnostic(issue);
            if (issuesByFile.has(issue.file))
                issuesByFile.get(issue.file).push(diagnostic);
            else
                issuesByFile.set(issue.file, [diagnostic]);
        });
        return issuesByFile;
    }
}
exports.LintCommand = LintCommand;
function typeToSeverity(type) {
    switch (type) {
        case "ERROR":
            return vscode.DiagnosticSeverity.Error;
        case "WARNING":
            return vscode.DiagnosticSeverity.Warning;
        case "NOTICE":
            return vscode.DiagnosticSeverity.Information;
    }
    return vscode.DiagnosticSeverity.Error;
}
function toDiagnostic(issue) {
    return new vscode.Diagnostic(new vscode.Range(issue.line - 1, 0, issue.line - 1, 100), issue.message, typeToSeverity(issue.type));
}
exports.LintDiagnosticsCollection = vscode.languages.createDiagnosticCollection("terraform-lint");
function lint(execPath, lintConfig, workspaceDir) {
    return new Promise((resolve, reject) => {
        let commandLineArgs = ["--format", "json"];
        if (lintConfig !== null) {
            commandLineArgs.push("--config", lintConfig);
        }
        const child = child_process_1.execFile(execPath, commandLineArgs, {
            cwd: workspaceDir,
            encoding: 'utf8',
            maxBuffer: 1024 * 1024
        }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                try {
                    let result = JSON.parse(stdout);
                    resolve(result);
                }
                catch (parseError) {
                    reject(parseError);
                }
            }
        });
    });
}

//# sourceMappingURL=lint.js.map
