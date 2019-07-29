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
const uuid = require("uuid/v4");
const vscode = require("vscode");
const logger_1 = require("../logger");
const telemetry_1 = require("../telemetry");
var CommandType;
(function (CommandType) {
    CommandType[CommandType["INTERNAL"] = 0] = "INTERNAL";
    CommandType[CommandType["PALETTE"] = 1] = "PALETTE";
})(CommandType = exports.CommandType || (exports.CommandType = {}));
class Command extends vscode.Disposable {
    constructor(name, ctx, type) {
        super(() => this.disposables.map(d => d.dispose()));
        this.name = name;
        this.ctx = ctx;
        this.trackSuccess = false;
        this.disposables = [];
        this.logger = new logger_1.Logger("<cmd>" + name);
        // validate command name
        if (type === CommandType.PALETTE) {
            const packageJson = require(ctx.asAbsolutePath('./package.json'));
            const commands = packageJson.contributes.commands;
            if (!commands.find((c) => c.command === this.command)) {
                throw new Error(`Cannot find ${this.command} in package.json`);
            }
        }
        this.eventName = "cmd:" + name;
        this.disposables.push(vscode.commands.registerCommand(this.command, (...args) => {
            return this.execute(...args);
        }, this));
        Command.RegisteredCommands.push(this.command);
    }
    get command() {
        return "terraform." + this.name;
    }
    execute(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const operationId = uuid();
            try {
                const start = process.hrtime();
                let result = this.perform(...args);
                const elapsed = process.hrtime(start);
                const elapsedMs = elapsed[0] * 1e3 + elapsed[1] / 1e6;
                if (this.trackSuccess) {
                    this.logger.info(`Finished command, took ${elapsedMs} ms.`);
                    telemetry_1.Reporter.trackEvent(this.eventName, { operationId: operationId }, { elapsedMs: elapsedMs });
                }
                return result;
            }
            catch (err) {
                this.logger.exception(`Execution of command failed`, err);
                if (telemetry_1.Reporter.enabled) {
                    this.logger.error(`If you open a bugreport at https://github.com/mauve/vscode-terraform/issues, please supply this operation ID: ${operationId}`);
                    telemetry_1.Reporter.trackException(this.eventName, err, { operationId: operationId });
                }
            }
        });
    }
}
Command.RegisteredCommands = [];
exports.Command = Command;

//# sourceMappingURL=command.js.map
