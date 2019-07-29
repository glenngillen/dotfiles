"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hcl = (function () {
    try {
        // running units
        return require('../../out/src/hcl-hil.js');
    }
    catch (_) {
        return require('../hcl-hil.js');
    }
})();
class ParseError extends Error {
    constructor(node, message) {
        super(message || "Unknown parse error");
        if (node.Pos) {
            this.fileName = node.Pos.Filename;
            this.offset = node.Pos.Offset;
            this.line = node.Pos.Line - 1;
            this.column = node.Pos.Column - 1;
        }
    }
}
exports.ParseError = ParseError;
function parseHcl(document) {
    let result = hcl.parseHcl(document);
    if (result[1]) {
        return [null, new ParseError(result[1], result[1].Err)];
    }
    return [result[0], null];
}
exports.parseHcl = parseHcl;
function parseHilWithPosition(document, column, line, fileName) {
    let result = hcl.parseHil(document, column, line, fileName);
    if (result[1]) {
        return [null, new ParseError(result[1], result[1].Err)];
    }
    return [result[0], null];
}
exports.parseHilWithPosition = parseHilWithPosition;

//# sourceMappingURL=hcl-hil.js.map
