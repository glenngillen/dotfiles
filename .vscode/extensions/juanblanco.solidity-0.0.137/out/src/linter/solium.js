'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSoliumRules = void 0;
const Solium = require("solium");
const vscode_languageserver_1 = require("vscode-languageserver");
const fs = require("fs");
exports.defaultSoliumRules = {};
class SoliumService {
    constructor(rootPath, soliumRules, vsConnection) {
        this.vsConnection = vsConnection;
        this.loadFileConfig(rootPath);
        this.setIdeRules(soliumRules);
    }
    isRootPathSet(rootPath) {
        return typeof rootPath !== 'undefined' && rootPath !== null;
    }
    setIdeRules(soliumRules) {
        if (typeof soliumRules === 'undefined' || soliumRules === null) {
            this.soliumRules = exports.defaultSoliumRules;
        }
        else {
            this.soliumRules = soliumRules;
        }
        if (typeof this.soliumRules['indentation'] === 'undefined' || this.soliumRules['indentation'] === null) {
            this.soliumRules['indentation'] = 'false';
        }
        if (process.platform === 'win32') {
            if (typeof this.soliumRules['linebreak-style'] === 'undefined' || this.soliumRules['linebreak-style'] === null) {
                this.soliumRules['linebreak-style'] = 'off';
            }
        }
    }
    lintAndFix(documentText) {
        return Solium.lintAndFix(documentText, this.getAllSettings());
    }
    getAllSettings() {
        if (this.fileConfig !== SoliumService.EMPTY_CONFIG && this.fileConfig !== false) {
            return this.fileConfig;
        }
        return {
            'extends': 'solium:recommended',
            'options': { 'returnInternalIssues': true },
            'plugins': ['security'],
            'rules': this.soliumRules,
        };
    }
    validate(filePath, documentText) {
        let items = [];
        try {
            items = Solium.lint(documentText, this.getAllSettings());
        }
        catch (err) {
            const match = /An error .*?\nSyntaxError: (.*?) Line: (\d+), Column: (\d+)/.exec(err.message);
            if (match) {
                const line = parseInt(match[2], 10) - 1;
                const character = parseInt(match[3], 10) - 1;
                return [
                    {
                        message: `Syntax error: ${match[1]}`,
                        range: {
                            end: {
                                character: character,
                                line: line,
                            },
                            start: {
                                character: character,
                                line: line,
                            },
                        },
                        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                    },
                ];
            }
            else {
                // this.vsConnection.window.showErrorMessage('solium error: ' + err);
                this.vsConnection.console.error('solium error: ' + err);
            }
        }
        return items.map(this.soliumLintResultToDiagnostic);
    }
    soliumLintResultToDiagnostic(lintResult) {
        const severity = lintResult.type === 'warning' ?
            vscode_languageserver_1.DiagnosticSeverity.Warning :
            vscode_languageserver_1.DiagnosticSeverity.Error;
        const line = lintResult.line - 1;
        return {
            message: `Linter: ${lintResult.ruleName}: ${lintResult.message}`,
            range: {
                end: {
                    character: lintResult.node.end,
                    line: line,
                },
                start: {
                    character: lintResult.column,
                    line: line,
                },
            },
            severity: severity,
        };
    }
    loadFileConfig(rootPath) {
        if (this.isRootPathSet(rootPath)) {
            const filePath = `${rootPath}/.soliumrc.json`;
            const readConfig = this.readFileConfig.bind(this, filePath);
            readConfig();
            fs.watchFile(filePath, { persistent: false }, readConfig);
        }
        else {
            this.fileConfig = SoliumService.EMPTY_CONFIG;
        }
    }
    readFileConfig(filePath) {
        this.fileConfig = SoliumService.EMPTY_CONFIG;
        fs.readFile(filePath, 'utf-8', this.onConfigLoaded.bind(this));
    }
    onConfigLoaded(err, data) {
        this.fileConfig = (!err) && JSON.parse(data);
    }
}
exports.default = SoliumService;
SoliumService.EMPTY_CONFIG = { rules: {} };
//# sourceMappingURL=solium.js.map