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
const minimatch = require("minimatch");
const vscode = require("vscode");
const logger_1 = require("../logger");
const telemetry_1 = require("../telemetry");
class FileSystemWatcher extends vscode.Disposable {
    constructor(index) {
        super(() => this.dispose());
        this.index = index;
        this.logger = new logger_1.Logger("file-system-watcher");
        this.watcher = vscode.workspace.createFileSystemWatcher("**/*.{tf,tfvars}");
        this.watcher.onDidChange((uri) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateDocument(uri);
        }));
        this.watcher.onDidCreate((uri) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateDocument(uri);
        }));
        this.watcher.onDidDelete(uri => this.onDidDelete(uri));
    }
    dispose() {
        this.watcher.dispose();
    }
    crawl() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("Crawling workspace for terraform files...");
            const start = process.hrtime();
            const files = yield vscode.workspace.findFiles("**/*.{tf,tfvars}");
            yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Indexing terraform templates",
                cancellable: false
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                for (let i = 0; i < files.length; ++i) {
                    const uri = files[i];
                    // Exclude the configured paths from the FindFiles results
                    // before indexing those files unnecessarily on init.
                    if (this.index.excludePaths.length > 0) {
                        let path = vscode.workspace.asRelativePath(uri).replace('\\', '/');
                        let matches = this.index.excludePaths.map((pattern) => {
                            return minimatch(path, pattern);
                        });
                        if (matches.some((v) => v)) {
                            // ignore
                            this.logger.debug(`Ignoring document: ${uri.toString()}`);
                        }
                        else {
                            yield this.updateDocument(uri);
                        }
                    }
                    progress.report({
                        message: `Indexing ${uri.toString()}`,
                        increment: files.length / 100
                    });
                }
            }));
            const elapsed = process.hrtime(start);
            const elapsedMs = elapsed[0] * 1e3 + elapsed[1] / 1e6;
            telemetry_1.Reporter.trackEvent("initialCrawl", {}, {
                totalTimeMs: elapsedMs,
                numberOfDocs: files.length,
                averagePerDocTimeMs: elapsedMs / files.length
            });
            return files;
        });
    }
    onDidDelete(uri) {
        try {
            this.index.delete(uri);
        }
        catch (error) {
            this.logger.exception(`Could not delete index for deleted file: ${uri.toString()}`, error);
        }
    }
    updateDocument(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield vscode.workspace.openTextDocument(uri);
            if (doc.isDirty || doc.languageId !== "terraform") {
                // ignore
                return;
            }
            try {
                let [file, group] = this.index.indexDocument(doc);
                if (!file || !group) {
                    this.logger.info(`Index not generated for: ${uri.toString()}`);
                }
                else {
                    this.logger.info(`Indexed ${uri.toString()}`);
                }
            }
            catch (e) {
                this.logger.exception("Could not index template file", e);
                let range = new vscode.Range(0, 0, 0, 300);
                let diagnostics = new vscode.Diagnostic(range, `Unhandled error parsing document: ${e}`, vscode.DiagnosticSeverity.Error);
                this.index.errors.set(uri, [diagnostics]);
            }
        });
    }
}
exports.FileSystemWatcher = FileSystemWatcher;

//# sourceMappingURL=crawler.js.map
