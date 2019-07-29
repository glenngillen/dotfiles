"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const originalRequire = require("original-require");
const LoadingStrategy_1 = require("./LoadingStrategy");
class Local extends LoadingStrategy_1.default {
    load(localPath) {
        return this.getLocalCompiler(localPath);
    }
    getLocalCompiler(localPath) {
        let compiler, compilerPath;
        compilerPath = path.isAbsolute(localPath)
            ? localPath
            : path.resolve(process.cwd(), localPath);
        try {
            compiler = originalRequire(compilerPath);
            this.removeListener();
        }
        catch (error) {
            throw this.errors("noPath", localPath, error);
        }
        return compiler;
    }
}
exports.default = Local;
//# sourceMappingURL=Local.js.map