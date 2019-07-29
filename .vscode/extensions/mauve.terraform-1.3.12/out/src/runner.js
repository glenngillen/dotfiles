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
const path = require("path");
const vscode = require("vscode");
const ansi_1 = require("./ansi");
const configuration_1 = require("./configuration");
const logger_1 = require("./logger");
const telemetry_1 = require("./telemetry");
const version_1 = require("./runner/version");
function processOutput(output, options) {
    if (options.keepAnsi)
        return output;
    return ansi_1.stripAnsi(output);
}
function execFileAsync(binaryPath) {
    return new Promise((resolve, reject) => {
        child_process_1.execFile(binaryPath, ['-version'], {
            encoding: 'utf8',
            maxBuffer: 1024 * 1024
        }, (error, stdout) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(stdout);
            }
        });
    });
}
function getTerraformVersion(binaryPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const output = yield execFileAsync(binaryPath);
        const lines = output.split('\n', 1);
        if (lines.length === 0)
            return { path: binaryPath, version: null };
        return {
            path: binaryPath,
            version: version_1.TerraformVersion.parse(lines[0])
        };
    });
}
class Runner extends vscode.Disposable {
    constructor() {
        super(() => this.dispose());
        this.disposables = [];
        this.logger = new logger_1.Logger("runner");
        this.executables = [];
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration));
    }
    static create() {
        return __awaiter(this, void 0, void 0, function* () {
            let runner = new Runner();
            yield runner.detect();
            return runner;
        });
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    get defaultExecutable() {
        if (this.executables.length === 0)
            return null;
        // sort by version
        const sorted = this.executables.sort((left, right) => {
            return version_1.TerraformVersion.compare(left.version, right.version);
        });
        // take highest
        return sorted[sorted.length - 1];
    }
    getRequiredExecutable(requirement) {
        const supported = this.executables.filter(e => e.version && requirement.isFulfilledBy(e.version));
        return supported.sort((left, right) => version_1.TerraformVersion.compare(left.version, right.version))[0];
    }
    run(options, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options)
                options = {};
            if (!options.executable)
                options.executable = this.defaultExecutable;
            const cwd = options.cwd || process.cwd();
            this.logger.info(`Running terraform cwd='${cwd}' path='${options.executable.path}' (version: ${options.executable.version}) args=[${args.join(", ")}]`);
            return new Promise((resolve, reject) => {
                const child = child_process_1.execFile(options.executable.path, args, {
                    encoding: 'utf8',
                    maxBuffer: 1024 * 1024,
                    cwd: cwd
                }, (error, stdout, stderr) => {
                    if (options.reportMetric === true) {
                        telemetry_1.Reporter.trackEvent("terraform-invocation", {
                            command: args[0],
                            status: error ? error.name : "success"
                        });
                    }
                    if (error) {
                        const processedOutput = processOutput(stderr, options);
                        this.logger.error(`Running terraform failed: ${error}`);
                        reject(processedOutput);
                    }
                    else {
                        this.logger.info(`Running terraform succeeded.`);
                        resolve(processOutput(stdout, options));
                    }
                });
                if (options.input) {
                    child.stdin.write(options.input);
                    child.stdin.end();
                }
            });
        });
    }
    detect() {
        return __awaiter(this, void 0, void 0, function* () {
            let configured = yield this.checkExecutables(this.configuredExecutables());
            let found = yield this.findInPath();
            this.executables = configured.concat(found);
        });
    }
    onDidChangeConfiguration(e) {
        if (!e.affectsConfiguration("terraform.path"))
            return;
        if (!e.affectsConfiguration("terraform.paths"))
            return;
        this.logger.info("Configuration change detected, checking installed Terraform versions...");
        this.detect();
    }
    configuredExecutables() {
        const cfg = configuration_1.getConfiguration();
        const paths = cfg.paths.map(p => {
            if (typeof p === "string")
                return { path: p };
            else
                return p;
        });
        return [{ path: cfg.path }, ...paths];
    }
    checkExecutables(configured) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            for (const c of configured) {
                let detected;
                try {
                    detected = yield getTerraformVersion(c.path);
                }
                catch (err) {
                    this.logger.warn(`Error while checking version of ${c.path}: ${err}`);
                    this.logger.warn(`Ignoring configured binary '${c.path}'`);
                    continue;
                }
                if (!detected.version) {
                    if (c.version) {
                        this.logger.warn(`Could not detect version of ${detected.path}, using configured version ${c.version}`);
                        detected.version = version_1.TerraformVersion.parse(`Terraform v${c.version}`);
                        if (!detected.version) {
                            this.logger.error(`Could not parse version of ${c.version}, marking as unknown`);
                        }
                    }
                    else {
                        this.logger.warn(`Could not detect version of ${detected.path}`);
                    }
                }
                else {
                    if (c.version && c.version !== detected.version.toString()) {
                        this.logger.warn(`Executable with path: '${c.path}', configured version ${c.version} differs from detected version ${detected.version}, using configured version`);
                    }
                }
                this.logger.info(`Found Terraform binary ${detected.path} with version ${detected.version}`);
                result.push(detected);
            }
            return result;
        });
    }
    findInPath() {
        return __awaiter(this, void 0, void 0, function* () {
            const PATH = process.env.PATH;
            let found = [];
            for (const p of PATH.split(path.delimiter)) {
                const binaryPath = path.join(p, 'terraform');
                try {
                    const detected = yield getTerraformVersion(binaryPath);
                    if (!detected.version) {
                        this.logger.warn(`Could not detect version of ${detected.path}`);
                    }
                    this.logger.info(`Found Terraform binary ${detected.path} with version ${detected.version}`);
                    found.push(detected);
                }
                catch (err) {
                    if (err.code !== "ENOENT") {
                        this.logger.error(`Ignoring Terraform binary ${binaryPath}: ${err}`);
                    }
                }
            }
            return found;
        });
    }
}
exports.Runner = Runner;

//# sourceMappingURL=runner.js.map
