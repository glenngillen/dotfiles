"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const LoadingStrategy_1 = require("./LoadingStrategy");
const VersionRange_1 = require("./VersionRange");
class Native extends LoadingStrategy_1.default {
    load() {
        const versionString = this.validateAndGetSolcVersion();
        const command = "solc --standard-json";
        const versionRange = new VersionRange_1.default();
        const commit = versionRange.getCommitFromVersion(versionString);
        return versionRange
            .getSolcByCommit(commit)
            .then(solcjs => {
            return {
                compile: options => String(child_process_1.execSync(command, { input: options })),
                version: () => versionString,
                importsParser: solcjs
            };
        })
            .catch(error => {
            if (error.message === "No matching version found") {
                throw this.errors("noVersion", versionString);
            }
            throw new Error(error);
        });
    }
    validateAndGetSolcVersion() {
        let version;
        try {
            version = child_process_1.execSync("solc --version");
        }
        catch (error) {
            throw this.errors("noNative", null, error);
        }
        return new VersionRange_1.default().normalizeSolcVersion(version);
    }
}
exports.default = Native;
//# sourceMappingURL=Native.js.map