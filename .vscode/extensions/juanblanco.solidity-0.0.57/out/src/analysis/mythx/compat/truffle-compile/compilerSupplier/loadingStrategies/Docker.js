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
const request = require("request-promise");
const fs = require("fs");
const child_process_1 = require("child_process");
// import * as ora from 'ora';
const semver = require("semver");
const LoadingStrategy_1 = require("./LoadingStrategy");
const VersionRange_1 = require("./VersionRange");
class Docker extends LoadingStrategy_1.default {
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const versionString = yield this.validateAndGetSolcVersion();
            const command = 'docker run -i ethereum/solc:' + this.config.version + ' --standard-json';
            const versionRange = new VersionRange_1.default();
            const commit = versionRange.getCommitFromVersion(versionString);
            return versionRange
                .getSolcByCommit(commit)
                .then(solcjs => {
                return {
                    compile: options => String(child_process_1.execSync(command, { input: options })),
                    importsParser: solcjs,
                    version: () => versionString,
                };
            })
                .catch(error => {
                if (error.message === 'No matching version found') {
                    throw this.errors('noVersion', versionString);
                }
                throw new Error(error);
            });
        });
    }
    getDockerTags() {
        return request(this.config.dockerTagsUrl)
            .then(list => JSON.parse(list).results.map(item => item.name))
            .catch(error => {
            throw this.errors('noRequest', this.config.dockerTagsUrl, error);
        });
    }
    downloadDockerImage(image) {
        if (!semver.valid(image)) {
            const message = `The image version you have provided is not valid.\n` +
                `Please ensure that ${image} is a valid docker image name.`;
            throw new Error(message);
        }
        // const spinner = ora({
        //   color: 'red',
        //   text: 'Downloading Docker image',
        // }).start();
        try {
            child_process_1.execSync(`docker pull ethereum/solc:${image}`);
            // spinner.stop();
        }
        catch (error) {
            // spinner.stop();
            throw new Error(error);
        }
    }
    validateAndGetSolcVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const image = this.config.version;
            const fileName = image + '.version';
            // Skip validation if they've validated for this image before.
            if (this.fileIsCached(fileName)) {
                const cachePath = this.resolveCache(fileName);
                return fs.readFileSync(cachePath, 'utf-8');
            }
            // Image specified
            if (!image) {
                throw this.errors('noString', image);
            }
            // Docker exists locally
            try {
                child_process_1.execSync('docker -v');
            }
            catch (error) {
                throw this.errors('noDocker');
            }
            // Image exists locally
            try {
                child_process_1.execSync('docker inspect --type=image ethereum/solc:' + image);
            }
            catch (error) {
                console.log(`${image} does not exist locally.\n`);
                console.log('Attempting to download the Docker image.');
                this.downloadDockerImage(image);
            }
            // Get version & cache.
            const version = child_process_1.execSync('docker run ethereum/solc:' + image + ' --version');
            const normalized = new VersionRange_1.default().normalizeSolcVersion(version);
            this.addFileToCache(normalized, fileName);
            return normalized;
        });
    }
}
exports.default = Docker;
//# sourceMappingURL=Docker.js.map