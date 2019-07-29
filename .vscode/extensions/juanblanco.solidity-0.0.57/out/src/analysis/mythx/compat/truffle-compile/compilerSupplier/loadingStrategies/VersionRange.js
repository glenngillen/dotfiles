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
const Debug = require("debug");
const requireFromString = require("require-from-string");
const fs = require("fs");
// import * as ora from 'ora';
const originalRequire = require("original-require");
const request = require("request-promise");
const semver = require("semver");
const solcWrap = require("solc/wrapper");
const LoadingStrategy_1 = require("./LoadingStrategy");
const debug = Debug('compile:compilerSupplier');
class VersionRange extends LoadingStrategy_1.default {
    compilerFromString(code) {
        const soljson = requireFromString(code);
        const wrapped = solcWrap(soljson);
        this.removeListener();
        return wrapped;
    }
    findNewestValidVersion(version, allVersions) {
        if (!semver.validRange(version)) {
            return null;
        }
        const satisfyingVersions = Object.keys(allVersions.releases)
            .map(solcVersion => {
            if (semver.satisfies(solcVersion, version)) {
                return solcVersion;
            }
        })
            .filter(solcVersion => solcVersion);
        if (satisfyingVersions.length > 0) {
            return satisfyingVersions.reduce((newestVersion, v) => {
                return semver.gtr(v, newestVersion) ? v : newestVersion;
            }, '0.0.0');
        }
        else {
            return null;
        }
    }
    getCachedSolcByFileName(fileName) {
        const filePath = this.resolveCache(fileName);
        const soljson = originalRequire(filePath);
        debug('soljson %o', soljson);
        const wrapped = solcWrap(soljson);
        this.removeListener();
        return wrapped;
    }
    // Range can also be a single version specification like "0.5.0"
    getCachedSolcByVersionRange(version) {
        const cachedCompilerFileNames = fs.readdirSync(this.cachePath);
        const validVersions = cachedCompilerFileNames.filter(fileName => {
            const match = fileName.match(/v\d+\.\d+\.\d+.*/);
            if (match) {
                return semver.satisfies(match[0], version);
            }
        });
        const multipleValidVersions = validVersions.length > 1;
        const compilerFileName = multipleValidVersions
            ? this.getMostRecentVersionOfCompiler(validVersions)
            : validVersions[0];
        return this.getCachedSolcByFileName(compilerFileName);
    }
    getCachedSolcFileName(commit) {
        const cachedCompilerFileNames = fs.readdirSync(this.cachePath);
        return cachedCompilerFileNames.find(fileName => {
            return fileName.includes(commit);
        });
    }
    getCommitFromVersion(versionString) {
        return 'commit.' + versionString.match(/commit\.(.*?)\./)[1];
    }
    getMostRecentVersionOfCompiler(versions) {
        return versions.reduce((mostRecentVersionFileName, fileName) => {
            const match = fileName.match(/v\d+\.\d+\.\d+.*/);
            const mostRecentVersionMatch = mostRecentVersionFileName.match(/v\d+\.\d+\.\d+.*/);
            return semver.gtr(match[0], mostRecentVersionMatch[0])
                ? fileName
                : mostRecentVersionFileName;
        }, '-v0.0.0+commit');
    }
    getSatisfyingVersionFromCache(versionRange) {
        if (this.versionIsCached(versionRange)) {
            return this.getCachedSolcByVersionRange(versionRange);
        }
        throw this.errors('noVersion', versionRange);
    }
    getSolcByCommit(commit) {
        return __awaiter(this, void 0, void 0, function* () {
            const solcFileName = this.getCachedSolcFileName(commit);
            if (solcFileName) {
                return this.getCachedSolcByFileName(solcFileName);
            }
            const allVersions = yield this.getSolcVersions();
            const fileName = this.getSolcVersionFileName(commit, allVersions);
            if (!fileName) {
                throw new Error('No matching version found');
            }
            return this.getSolcByUrlAndCache(fileName);
        });
    }
    getSolcByUrlAndCache(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.config.compilerUrlRoot + fileName;
            // const spinner = ora({
            //   color: 'red',
            //   text: 'Downloading compiler',
            // }).start();
            try {
                const response = yield request.get(url);
                // spinner.stop();
                this.addFileToCache(response, fileName);
                return this.compilerFromString(response);
            }
            catch (error) {
                // spinner.stop();
                throw this.errors('noRequest', url, error);
            }
        });
    }
    getSolcFromCacheOrUrl(version) {
        return __awaiter(this, void 0, void 0, function* () {
            let allVersions;
            try {
                allVersions = yield this.getSolcVersions();
            }
            catch (error) {
                throw this.errors('noRequest', version, error);
            }
            const fileName = this.getSolcVersionFileName(version, allVersions);
            if (!fileName) {
                throw this.errors('noVersion', version);
            }
            if (this.fileIsCached(fileName)) {
                return this.getCachedSolcByFileName(fileName);
            }
            return this.getSolcByUrlAndCache(fileName);
        });
    }
    getSolcVersions() {
        // const spinner = ora({
        //   color: 'yellow',
        //   text: 'Fetching solc version list from solc-bin',
        // }).start();
        return request(this.config.versionsUrl)
            .then(list => {
            // spinner.stop();
            return JSON.parse(list);
        })
            .catch(err => {
            // spinner.stop();
            throw this.errors('noRequest', this.config.versionsUrl, err);
        });
    }
    getSolcVersionFileName(version, allVersions) {
        if (allVersions.releases[version]) {
            return allVersions.releases[version];
        }
        const isPrerelease = version.includes('nightly') || version.includes('commit');
        if (isPrerelease) {
            for (const build of allVersions.builds) {
                const exists = build['prerelease'] === version ||
                    build['build'] === version ||
                    build['longVersion'] === version;
                if (exists) {
                    return build['path'];
                }
            }
        }
        const versionToUse = this.findNewestValidVersion(version, allVersions);
        if (versionToUse) {
            return allVersions.releases[versionToUse];
        }
        return null;
    }
    load(versionRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const rangeIsSingleVersion = semver.valid(versionRange);
            if (rangeIsSingleVersion && this.versionIsCached(versionRange)) {
                return this.getCachedSolcByVersionRange(versionRange);
            }
            try {
                return yield this.getSolcFromCacheOrUrl(versionRange);
            }
            catch (error) {
                if (error.message.includes('Failed to complete request')) {
                    return this.getSatisfyingVersionFromCache(versionRange);
                }
                throw new Error(error);
            }
        });
    }
    normalizeSolcVersion(input) {
        const version = String(input);
        return version.split(':')[1].trim();
    }
    versionIsCached(version) {
        const cachedCompilerFileNames = fs.readdirSync(this.cachePath);
        const cachedVersions = cachedCompilerFileNames.map(fileName => {
            const match = fileName.match(/v\d+\.\d+\.\d+.*/);
            if (match) {
                return match[0];
            }
        });
        return cachedVersions.find(cachedVersion => semver.satisfies(cachedVersion, version));
    }
}
exports.default = VersionRange;
//# sourceMappingURL=VersionRange.js.map