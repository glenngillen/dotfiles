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
class UriQuickPickItem {
    constructor(label, uri) {
        this.label = label;
        this.uri = uri;
        this.description = "";
        this.detail = "";
    }
}
function uriQuickPick(uris, placeHolder) {
    return __awaiter(this, void 0, void 0, function* () {
        if (uris.length === 0)
            return undefined;
        if (uris.length === 1)
            return uris[0];
        let picks = uris.map((u) => new UriQuickPickItem(vscode.workspace.asRelativePath(u), u));
        let pick = yield vscode.window.showQuickPick(picks, {
            placeHolder: placeHolder
        });
        if (!pick)
            return undefined;
        return pick.uri;
    });
}
exports.uriQuickPick = uriQuickPick;

//# sourceMappingURL=uri-quickpick.js.map
