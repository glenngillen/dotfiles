"use strict";
// Truffle related code.
/* FIXME - use truffle libraries more */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);
exports.parseBuildJson = (file) => __awaiter(this, void 0, void 0, function* () {
    const buildJson = yield readFile(file, 'utf8');
    const buildObj = JSON.parse(buildJson);
    return buildObj;
});
// Directories that must be in a truffle project
const TRUFFLE_ROOT_DIRS = ['contracts', 'migrations'];
// FIXME: remove this after tests are covered and async  is used
function isTruffleRoot(p) {
    for (const shortDir of TRUFFLE_ROOT_DIRS) {
        const dir = `${p}/${shortDir}`;
        if (!fs.existsSync(dir)) {
            return false;
        }
        const dirStat = fs.statSync(dir);
        if (!dirStat || !dirStat.isDirectory()) {
            return false;
        }
    }
    return true;
}
exports.isTruffleRoot = isTruffleRoot;
// FIXME: remove this after tests are covered and async  is used
// Return dirname of path p, unless we think this
// part of a truffle project, in which case we'll
// it is in a "contracts" directory and then the
// we return the parent directory which is the
// root of the truffle project.
function getRootDir(p) {
    const dirname = path.resolve(path.dirname(p));
    if (path.basename(dirname) === 'contracts') {
        const parent = path.normalize(`${dirname}/..`);
        if (isTruffleRoot(parent)) {
            return parent;
        }
    }
    return dirname;
}
exports.getRootDir = getRootDir;
exports.isTruffleRootAsync = (p) => __awaiter(this, void 0, void 0, function* () {
    const all = yield Promise.all(TRUFFLE_ROOT_DIRS.map((shortDir) => __awaiter(this, void 0, void 0, function* () {
        try {
            const dir = yield stat(`${p}/${shortDir}`);
            return dir.isDirectory();
        }
        catch (err) {
            return false;
        }
    })));
    const notTruffleDirs = all.filter(x => x === false);
    return notTruffleDirs.length === 0;
});
exports.getRootDirAsync = (p) => __awaiter(this, void 0, void 0, function* () {
    const dirname = path.resolve(path.dirname(p));
    if (path.basename(dirname) === 'contracts') {
        const parent = path.normalize(`${dirname}/..`);
        const isRoot = yield exports.isTruffleRootAsync(parent);
        if (isRoot) {
            return parent;
        }
    }
    return dirname;
});
/**
 * Scans Truffle smart contracts build directory and returns
 * array of paths to smart contract build JSON files.
 *
 * @param {string} directory - path to truffle smart contracts build directory. {
 * @returns {Array<string>} - list of JSON files.
 */
exports.getTruffleBuildJsonFilesAsync = function (directory) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield readdir(directory);
        const filtered = files.filter(f => f !== 'Migrations.json');
        const filePaths = filtered.map(f => path.join(directory, f));
        return filePaths;
    });
};
function getBuildContractsDir(p) {
    return `${p}/build/contracts`;
}
exports.getBuildContractsDir = getBuildContractsDir;
function getBuildMythxContractsDir(p) {
    return `${p}/build/mythx/contracts`;
}
exports.getBuildMythxContractsDir = getBuildMythxContractsDir;
function getContractsDir(p) {
    return `${p}/contracts`;
}
exports.getContractsDir = getContractsDir;
function getMythReportsDir(buildMythXContractsDir) {
    return path.normalize(path.join(buildMythXContractsDir, '..', 'reports'));
}
exports.getMythReportsDir = getMythReportsDir;
//# sourceMappingURL=trufstuf.js.map