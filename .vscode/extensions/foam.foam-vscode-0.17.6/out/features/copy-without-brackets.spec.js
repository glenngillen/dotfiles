"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
describe('copyWithoutBrackets', () => {
    it('should get the input from the active editor selection', async () => {
        const { uri } = await test_utils_vscode_1.createFile('This is my [[test-content]].');
        const { editor } = await test_utils_vscode_1.showInEditor(uri);
        editor.selection = new vscode_1.Selection(new vscode_1.Position(0, 0), new vscode_1.Position(1, 0));
        await vscode_1.commands.executeCommand('foam-vscode.copy-without-brackets');
        const value = await vscode_1.env.clipboard.readText();
        expect(value).toEqual('This is my Test Content.');
    });
});
//# sourceMappingURL=copy-without-brackets.spec.js.map