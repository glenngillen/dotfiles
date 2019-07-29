"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function read(path) {
    return new Promise((resolve, reject) => {
        fs_1.readFile(path, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.toString('utf8'));
            }
        });
    });
}
exports.read = read;
function readBuffer(path) {
    return new Promise((resolve, reject) => {
        fs_1.readFile(path, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.readBuffer = readBuffer;
function backwardsSearch(haystack, matcher) {
    if (haystack.length === 0)
        return -1;
    for (let i = haystack.length - 1; i >= 0; i--) {
        if (matcher(haystack[i])) {
            return i;
        }
    }
    return -1;
}
exports.backwardsSearch = backwardsSearch;
function count(haystack, character) {
    let result = 0;
    for (let i = 0; i < haystack.length; i++) {
        if (haystack[i] === character)
            result++;
    }
    return result;
}
exports.count = count;
function compareTermLists(left, right) {
    const minLength = Math.min(left.length, right.length);
    for (let i = 0; i < minLength; i++) {
        if (left[i] < right[i])
            return -1;
        if (left[i] > right[i])
            return 1;
    }
    return 0;
}
exports.compareTermLists = compareTermLists;

//# sourceMappingURL=helpers.js.map
