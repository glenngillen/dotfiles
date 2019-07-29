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
const vscode_adapter_1 = require("../index/vscode-adapter");
const command_1 = require("./command");
class NavigateToSectionCommand extends command_1.Command {
    constructor(index, ctx) {
        super("navigate-to-section", ctx, command_1.CommandType.INTERNAL);
        this.index = index;
    }
    perform(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = this.index.index.group(args.groupUri);
            if (!group) {
                throw new Error(`Cannot find index group with uri ${args.groupUri}`);
            }
            const section = group.section(args.targetId);
            if (!section) {
                return yield vscode.window.showErrorMessage(`No section with id ${args.targetId}`);
            }
            yield vscode.window.showTextDocument(section.location.uri, {
                selection: vscode_adapter_1.to_vscode_Range(section.location.range)
            });
        });
    }
}
exports.NavigateToSectionCommand = NavigateToSectionCommand;

//# sourceMappingURL=navigatetosection.js.map
