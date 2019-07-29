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
const vscode = require("vscode");
const configuration_1 = require("../configuration");
const command_1 = require("./command");
class ValidateCommand extends command_1.Command {
    constructor(index, runner, ctx) {
        super("validate", ctx, command_1.CommandType.PALETTE);
        this.index = index;
        this.runner = runner;
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const path = configuration_1.getConfiguration().path;
            try {
                for (const group of this.index.index.groups) {
                    this.logger.info(`Validating group ${group.uri.toString()}`);
                    const output = yield this.runner.run({}, "validate", "-no-color", group.uri.fsPath);
                    for (const line of output.split('\n')) {
                        this.logger.info("output: ", line);
                    }
                }
            }
            catch (err) {
                this.logger.warn("Validation failed: ", err);
                return yield vscode.window.showErrorMessage("Validation failed, more information in the output tab.");
            }
        });
    }
}
exports.ValidateCommand = ValidateCommand;

//# sourceMappingURL=validate.js.map
