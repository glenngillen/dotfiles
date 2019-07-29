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
const group_quickpick_1 = require("../group-quickpick");
const command_1 = require("./command");
class PlanCommand extends command_1.Command {
    constructor(runner, index, ctx) {
        super("show-plan", ctx, command_1.CommandType.PALETTE);
        this.runner = runner;
        this.index = index;
    }
    perform(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let group = yield group_quickpick_1.groupQuickPick(this.index.index);
            if (!group)
                return;
            try {
                let executable = this.getExecutable(group);
                let definition = { type: "terraform", command: "plan" };
                let task = new vscode.Task(definition, vscode.TaskScope.Workspace, "terraform plan", "terraform", new vscode.ProcessExecution(executable.path, ["plan", "-input=false", "."], {
                    cwd: group.uri.fsPath
                }));
                let execution = yield vscode.tasks.executeTask(task);
            }
            catch (error) {
                yield vscode.window.showErrorMessage(error.message);
            }
        });
    }
    getExecutable(group) {
        let requirement = group.terraformSections.map(f => f.requirement).find(r => !!r);
        if (requirement) {
            let executable = this.runner.getRequiredExecutable(requirement);
            if (!executable) {
                throw new Error(`Cannot find terraform executable to satisfy requirement ${requirement.toString()}`);
            }
            return executable;
        }
        else {
            let executable = this.runner.defaultExecutable;
            if (!executable) {
                throw new Error(`No terraform executable available`);
            }
            return executable;
        }
    }
}
exports.PlanCommand = PlanCommand;

//# sourceMappingURL=plan.js.map
