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
const path = require("path");
const fs = require("fs");
const semver = require("semver");
const Bundled_1 = require("./loadingStrategies/Bundled");
const Docker_1 = require("./loadingStrategies/Docker");
const Native_1 = require("./loadingStrategies/Native");
const Local_1 = require("./loadingStrategies/Local");
const VersionRange_1 = require("./loadingStrategies/VersionRange");
class CompilerSupplier {
    constructor(_config) {
        _config = _config || {};
        const defaultConfig = { version: null };
        this.config = Object.assign({}, defaultConfig, _config);
        this.strategyOptions = { version: this.config.version };
    }
    badInputError(userSpecification) {
        const message = `Could not find a compiler version matching ${userSpecification}. ` +
            `compilers.solc.version option must be a string specifying:\n` +
            `   - a path to a locally installed solcjs\n` +
            `   - a solc version or range (ex: '0.4.22' or '^0.5.0')\n` +
            `   - a docker image name (ex: 'stable')\n` +
            `   - 'native' to use natively installed solc\n`;
        return new Error(message);
    }
    load() {
        const userSpecification = this.config.version;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let strategy;
            const useDocker = this.config.docker;
            const useNative = userSpecification === 'native';
            const useBundledSolc = !userSpecification;
            const useSpecifiedLocal = userSpecification && this.fileExists(userSpecification);
            const isValidVersionRange = semver.validRange(userSpecification);
            if (useDocker) {
                strategy = new Docker_1.default(this.strategyOptions);
            }
            else if (useNative) {
                strategy = new Native_1.default(this.strategyOptions);
            }
            else if (useBundledSolc) {
                strategy = new Bundled_1.default(this.strategyOptions);
            }
            else if (useSpecifiedLocal) {
                strategy = new Local_1.default(this.strategyOptions);
            }
            else if (isValidVersionRange) {
                strategy = new VersionRange_1.default(this.strategyOptions);
            }
            if (strategy) {
                try {
                    const solc = yield strategy.load(userSpecification);
                    resolve(solc);
                }
                catch (error) {
                    reject(error);
                }
            }
            else {
                reject(this.badInputError(userSpecification));
            }
        }));
    }
    fileExists(localPath) {
        return fs.existsSync(localPath) || path.isAbsolute(localPath);
    }
    getDockerTags() {
        return new Docker_1.default(this.strategyOptions).getDockerTags();
    }
    getReleases() {
        return new VersionRange_1.default(this.strategyOptions)
            .getSolcVersions()
            .then(list => {
            const prereleases = list.builds
                .filter(build => build['prerelease'])
                .map(build => build['longVersion']);
            const releases = Object.keys(list.releases);
            return {
                prereleases: prereleases,
                releases: releases,
                latestRelease: list.latestRelease,
            };
        });
    }
}
exports.default = CompilerSupplier;
//# sourceMappingURL=index.js.map