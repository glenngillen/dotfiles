"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimatch = require("minimatch");
const vscode = require("vscode");
const configuration_1 = require("../configuration");
const logger_1 = require("../logger");
const file_index_1 = require("./file-index");
const vscode_adapter_1 = require("./vscode-adapter");
class IndexAdapter extends vscode.Disposable {
    constructor(index, excludePaths) {
        super(() => this.dispose());
        this.index = index;
        this.excludePaths = excludePaths;
        this.logger = new logger_1.Logger("index-adapter");
        this.disposables = [];
        this._onDidChange = new vscode.EventEmitter();
        this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(this.onDidChangeWorkspaceFolders));
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration));
        this.errors = vscode.languages.createDiagnosticCollection("terraform-errors");
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    dispose() {
        this.errors.dispose();
        this._onDidChange.dispose();
        this.disposables.map(d => d.dispose());
    }
    onDidChangeWorkspaceFolders(e) {
        // TODO: remove all groups which are part e.removed[]
    }
    onDidChangeConfiguration(e) {
        if (!e.affectsConfiguration("terraform.indexing"))
            return;
        this.excludePaths = configuration_1.getConfiguration().indexing.exclude || [];
    }
    clear() {
        this.index.clear();
        this.errors.clear();
        this._onDidChange.fire({});
    }
    delete(uri) {
        this.index.delete(uri);
        this.errors.delete(uri);
        this._onDidChange.fire({});
    }
    indexDocument(document) {
        if (this.excludePaths.length > 0) {
            let path = vscode.workspace.asRelativePath(document.uri).replace('\\', '/');
            let matches = this.excludePaths.map((pattern) => {
                return minimatch(path, pattern);
            });
            if (matches.some((v) => v)) {
                // ignore
                this.logger.debug(`Ignoring document: ${document.uri.toString()}`);
                return [null, null];
            }
        }
        let [index, diagnostic] = file_index_1.FileIndex.fromString(document.uri, document.getText());
        let diagnostics = [];
        let group;
        if (diagnostic) {
            const range = new vscode.Range(diagnostic.range.start.line, diagnostic.range.start.character, diagnostic.range.end.line, diagnostic.range.end.character);
            diagnostics.push(new vscode.Diagnostic(range, diagnostic.message, vscode.DiagnosticSeverity.Error)); // TODO: actually map severity
        }
        if (index) {
            diagnostics.push(...index.diagnostics.map((d) => {
                const range = new vscode.Range(d.range.start.line, d.range.start.character, d.range.end.line, d.range.end.character);
                return new vscode.Diagnostic(range, d.message, vscode_adapter_1.to_vscode_DiagnosticsSeverity(d.severity)); // TODO: actually map severity
            }));
            group = this.index.add(index);
        }
        this.errors.set(document.uri, diagnostics);
        this._onDidChange.fire({});
        return [index, group];
    }
}
exports.IndexAdapter = IndexAdapter;

//# sourceMappingURL=index-adapter.js.map
