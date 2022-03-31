"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSlug = void 0;
const github_slugger_1 = __importDefault(require("github-slugger"));
exports.toSlug = (s) => github_slugger_1.default.slug(s);
//# sourceMappingURL=slug.js.map