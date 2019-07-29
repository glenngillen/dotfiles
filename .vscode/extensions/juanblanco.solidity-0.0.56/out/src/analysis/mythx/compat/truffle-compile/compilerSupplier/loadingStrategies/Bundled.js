"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoadingStrategy_1 = require("./LoadingStrategy");
class Bundled extends LoadingStrategy_1.default {
    load() {
        return this.getBundledSolc();
    }
    getBundledSolc() {
        this.removeListener();
        return require('solc');
    }
}
exports.default = Bundled;
//# sourceMappingURL=Bundled.js.map