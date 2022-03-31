"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.existsInFs = exports.relativeTo = exports.joinPath = exports.changeExtension = exports.getExtension = exports.getName = exports.getBasename = exports.getDirectory = exports.isAbsolute = exports.toFsPath = exports.fromFsPath = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
/**
 * Converts filesystem path to POSIX path. Supported inputs are:
 *   - Windows path starting with a drive letter, e.g. C:\dir\file.ext
 *   - UNC path for a shared file, e.g. \\server\share\path\file.ext
 *   - POSIX path, e.g. /dir/file.ext
 *
 * @param path A supported filesystem path.
 * @returns [path, authority] where path is a POSIX representation for the
 *     given input and authority is undefined except for UNC paths.
 */
function fromFsPath(path) {
    let authority;
    if (isUNCShare(path)) {
        [path, authority] = parseUNCShare(path);
        path = path.replace(/\\/g, '/');
    }
    else if (hasDrive(path)) {
        path = '/' + path[0].toUpperCase() + path.substr(1).replace(/\\/g, '/');
    }
    else if (path[0] === '/' && hasDrive(path, 1)) {
        // POSIX representation of a Windows path: just normalize drive letter case
        path = '/' + path[1].toUpperCase() + path.substr(2);
    }
    return [path, authority];
}
exports.fromFsPath = fromFsPath;
/**
 * Converts a POSIX path to a filesystem path.
 *
 * @param path A POSIX path.
 * @param authority An optional authority used to build UNC paths. This only
 *     makes sense for the Windows platform.
 * @returns A platform-specific representation of the given POSIX path.
 */
function toFsPath(path, authority) {
    if (path[0] === '/' && hasDrive(path, 1)) {
        path = path.substr(1).replace(/\//g, '\\');
        if (authority) {
            path = `\\\\${authority}${path}`;
        }
    }
    return path;
}
exports.toFsPath = toFsPath;
/**
 * Extracts the containing directory of a POSIX path, e.g.
 *    - /d1/d2/f.ext -> /d1/d2
 *    - /d1/d2 -> /d1
 *
 * @param path A POSIX path.
 * @returns true if the path is absolute, false otherwise.
 */
function isAbsolute(path) {
    return path_1.posix.isAbsolute(path);
}
exports.isAbsolute = isAbsolute;
/**
 * Extracts the containing directory of a POSIX path, e.g.
 *    - /d1/d2/f.ext -> /d1/d2
 *    - /d1/d2 -> /d1
 *
 * @param path A POSIX path.
 * @returns The containing directory of the given path.
 */
function getDirectory(path) {
    return path_1.posix.dirname(path);
}
exports.getDirectory = getDirectory;
/**
 * Extracts the basename of a POSIX path, e.g. /d/f.ext -> f.ext.
 *
 * @param path A POSIX path.
 * @returns The basename of the given path.
 */
function getBasename(path) {
    return path_1.posix.basename(path);
}
exports.getBasename = getBasename;
/**
 * Extracts the name of a POSIX path, e.g. /d/f.ext -> f.
 *
 * @param path A POSIX path.
 * @returns The name of the given path.
 */
function getName(path) {
    return changeExtension(getBasename(path), '*', '');
}
exports.getName = getName;
/**
 * Extracts the extension of a POSIX path, e.g.
 *    - /d/f.ext -> .ext
 *    - /d/f.g.ext -> .ext
 *    - /d/f -> ''
 *
 * @param path A POSIX path.
 * @returns The extension of the given path.
 */
function getExtension(path) {
    return path_1.posix.extname(path);
}
exports.getExtension = getExtension;
/**
 * Changes a POSIX path matching some extension to have another extension.
 *
 * @param path A POSIX path.
 * @param from The required current extension, or '*' to match any extension.
 * @param to The target extension.
 * @returns A POSIX path with its extension possibly changed.
 */
function changeExtension(path, from, to) {
    const old = getExtension(path);
    if ((from === '*' && old !== to) || old === from) {
        path = path.substring(0, path.length - old.length);
        return to ? path + to : path;
    }
    return path;
}
exports.changeExtension = changeExtension;
/**
 * Joins a number of POSIX paths into a single POSIX path, e.g.
 *    - /d1, d2, f.ext -> /d1/d2/f.ext
 *    - /d1/d2, .., f.ext -> /d1/f.ext
 *
 * @param paths A variable number of POSIX paths.
 * @returns A POSIX path built from the given POSIX paths.
 */
function joinPath(...paths) {
    return path_1.posix.join(...paths);
}
exports.joinPath = joinPath;
/**
 * Makes a POSIX path relative to another POSIX path, e.g.
 *    - /d1/d2 relative to /d1 -> d2
 *    - /d1/d2 relative to /d1/d3 -> ../d2
 *
 * @param path The POSIX path to be made relative.
 * @param basePath The POSIX base path.
 * @returns A POSIX path relative to the base path.
 */
function relativeTo(path, basePath) {
    return path_1.posix.relative(basePath, path);
}
exports.relativeTo = relativeTo;
/**
 * Asynchronously checks if there is an accessible file for a path.
 *
 * @param fsPath A filesystem-specific path.
 * @returns true if an accesible file exists, false otherwise.
 */
async function existsInFs(fsPath) {
    try {
        await fs_1.promises.access(fsPath, fs_1.constants.F_OK);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.existsInFs = existsInFs;
function hasDrive(path, idx = 0) {
    if (path.length <= idx) {
        return false;
    }
    const c = path.charCodeAt(idx);
    return (((c >= 65 /* A */ && c <= 90 /* Z */) ||
        (c >= 97 /* a */ && c <= 122 /* z */)) &&
        path.charCodeAt(idx + 1) === 58 /* Colon */);
}
function isUNCShare(fsPath) {
    return (fsPath.length >= 2 &&
        fsPath.charCodeAt(0) === 92 /* Backslash */ &&
        fsPath.charCodeAt(1) === 92 /* Backslash */);
}
function parseUNCShare(uncPath) {
    const idx = uncPath.indexOf('\\', 2);
    if (idx === -1) {
        return [uncPath.substring(2), '\\'];
    }
    else {
        return [uncPath.substring(2, idx), uncPath.substring(idx) || '\\'];
    }
}
//# sourceMappingURL=path.js.map