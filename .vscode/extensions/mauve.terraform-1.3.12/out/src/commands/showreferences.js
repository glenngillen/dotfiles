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
class ReferenceQuickPick {
    constructor(reference) {
        this.reference = reference;
        if (reference.section) {
            this.label = reference.section.id();
            this.description = reference.section.sectionType;
        }
        else {
            // tfvars
            this.label = "(assignment)";
            this.description = vscode.workspace.asRelativePath(reference.location.uri);
        }
    }
    goto() {
        vscode.window.showTextDocument(this.reference.location.uri, {
            preserveFocus: true,
            preview: true,
            selection: vscode_adapter_1.to_vscode_Range(this.reference.location.range)
        });
    }
}
class ShowReferencesCommand extends command_1.Command {
    constructor(index, ctx) {
        super("showReferences", ctx, command_1.CommandType.INTERNAL);
        this.index = index;
    }
    perform(section) {
        return __awaiter(this, void 0, void 0, function* () {
            let group = this.index.index.groupFor(section.location.uri);
            let picks = group.queryReferences("ALL_FILES", { target: section }).map((r) => new ReferenceQuickPick(r));
            return yield vscode.window.showQuickPick(picks, {
                onDidSelectItem: (r) => r.goto()
            });
        });
    }
}
exports.ShowReferencesCommand = ShowReferencesCommand;

//# sourceMappingURL=showreferences.js.map
