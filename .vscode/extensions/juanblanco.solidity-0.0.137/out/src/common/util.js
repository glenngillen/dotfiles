'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceRemappings = exports.formatPath = void 0;
function formatPath(contractPath) {
    return contractPath.replace(/\\/g, '/');
}
exports.formatPath = formatPath;
/**
 * Replaces remappings in the first array with matches from the second array,
 * then it concatenates only the unique strings from the 2 arrays.
 *
 * It splits the strings by '=' and checks the prefix of each element
 * @param remappings first array of remappings strings
 * @param replacer second array of remappings strings
 * @returns an array containing unique remappings
 */
function replaceRemappings(remappings, replacer) {
    remappings.forEach(function (remapping, index) {
        const prefix = remapping.split('=')[0];
        for (const replaceRemapping of replacer) {
            const replacePrefix = replaceRemapping.split('=')[0];
            if (prefix === replacePrefix) {
                remappings[index] = replaceRemapping;
                break;
            }
        }
    });
    return [...new Set([...remappings, ...replacer])];
}
exports.replaceRemappings = replaceRemappings;
//# sourceMappingURL=util.js.map