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
const helpers_1 = require("./helpers");
function renderTemplate(template, data) {
    return template.replace(/{{([a-zA-Z0-9]+)}}/g, (match, key) => {
        return data[key];
    });
}
exports.renderTemplate = renderTemplate;
function loadTemplate(path, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let contents = yield helpers_1.read(path);
        return renderTemplate(contents, data);
    });
}
exports.loadTemplate = loadTemplate;

//# sourceMappingURL=template.js.map
