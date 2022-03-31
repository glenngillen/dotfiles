"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = exports.isNumeric = exports.isNone = exports.isSome = exports.isNotNull = void 0;
const crypto_1 = __importDefault(require("crypto"));
function isNotNull(value) {
    return value != null;
}
exports.isNotNull = isNotNull;
function isSome(value) {
    return value != null;
}
exports.isSome = isSome;
function isNone(value) {
    return value == null;
}
exports.isNone = isNone;
function isNumeric(value) {
    return /-?\d+$/.test(value);
}
exports.isNumeric = isNumeric;
exports.hash = (text) => crypto_1.default
    .createHash('sha1')
    .update(text)
    .digest('hex');
//# sourceMappingURL=core.js.map