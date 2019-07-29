"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param {any} JSON object from a version reponss. Each attribute/key is
 *              a tool name and the value is a version string of the tool.
 * @returns string  A comma-separated string of tool: version
 */
function versionJSON2String(jsonResponse) {
    return Object.keys(jsonResponse).map((key) => `${key}: ${jsonResponse[key]}`).join(', ');
}
exports.versionJSON2String = versionJSON2String;
function getFormatter(style) {
    const formatterName = style || 'stylish';
    try {
        return require(`eslint/lib/formatters/${formatterName}`);
    }
    catch (ex) {
        ex.message = `\nThere was a problem loading formatter option: ${style} \nError: ${ex.message}`;
        throw ex;
    }
}
exports.getFormatter = getFormatter;
//# sourceMappingURL=util.js.map