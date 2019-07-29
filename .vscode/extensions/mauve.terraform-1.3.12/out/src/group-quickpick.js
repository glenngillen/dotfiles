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
class GroupQuickPickItem {
    constructor(group) {
        this.group = group;
        this.description = "";
        this.detail = "";
        this.label = vscode.workspace.asRelativePath(group.uri.toString()).toString();
    }
}
function groupQuickPick(index, placeHolder) {
    return __awaiter(this, void 0, void 0, function* () {
        if (index.groups.length === 0)
            return undefined;
        if (index.groups.length === 1)
            return index.groups[0];
        let picks = index.groups.map(g => new GroupQuickPickItem(g));
        let pick = yield vscode.window.showQuickPick(picks, {
            placeHolder: placeHolder
        });
        if (!pick)
            return undefined;
        return pick.group;
    });
}
exports.groupQuickPick = groupQuickPick;

//# sourceMappingURL=group-quickpick.js.map
