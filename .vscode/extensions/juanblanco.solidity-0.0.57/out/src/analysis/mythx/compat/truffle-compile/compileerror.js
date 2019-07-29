"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("colors");
const TruffleError = require("truffle-error");
class CompileError extends TruffleError {
    constructor(message) {
        const fancy_message = message.trim() + '\n' + colors.red('Compilation failed. See above.');
        const normal_message = message.trim();
        super(normal_message);
        this.message = fancy_message;
    }
}
exports.default = CompileError;
//# sourceMappingURL=compileerror.js.map