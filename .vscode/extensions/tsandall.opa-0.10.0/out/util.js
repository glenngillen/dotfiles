'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * String helpers for OPA types.
 */
function getPackage(parsed) {
    return getPathString(parsed["package"].path.slice(1));
}
exports.getPackage = getPackage;
function getImports(parsed) {
    if (parsed.imports !== undefined) {
        return parsed.imports.map((x) => {
            let str = getPathString(x.path.value);
            if (!x.alias) {
                return str;
            }
            return str + " as " + x.alias;
        });
    }
    return [];
}
exports.getImports = getImports;
function getPathString(path) {
    let i = -1;
    return path.map((x) => {
        i++;
        if (i === 0) {
            return x.value;
        }
        else {
            if (x.value.match('^[a-zA-Z_][a-zA-Z_0-9]*$')) {
                return "." + x.value;
            }
            return '["' + x.value + '"]';
        }
    }).join('');
}
exports.getPathString = getPathString;
function getPrettyTime(ns) {
    let seconds = ns / 1e9;
    if (seconds >= 1) {
        return seconds.toString() + 's';
    }
    let milliseconds = ns / 1e6;
    if (milliseconds >= 1) {
        return milliseconds.toString() + 'ms';
    }
    return (ns / 1e3).toString() + 'µs';
}
exports.getPrettyTime = getPrettyTime;
//# sourceMappingURL=util.js.map