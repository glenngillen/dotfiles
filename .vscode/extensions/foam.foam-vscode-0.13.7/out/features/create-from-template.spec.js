"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path_1 = __importDefault(require("path"));
describe('createFromTemplate', () => {
    describe('create-note-from-template', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('offers to create template when none are available', async () => {
            const spy = jest
                .spyOn(vscode_1.window, 'showQuickPick')
                .mockImplementationOnce(jest.fn(() => Promise.resolve(undefined)));
            await vscode_1.commands.executeCommand('foam-vscode.create-note-from-template');
            expect(spy).toBeCalledWith(['Yes', 'No'], {
                placeHolder: 'No templates available. Would you like to create one instead?',
            });
        });
    });
    describe('create-note-from-default-template', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('can be cancelled while resolving FOAM_TITLE', async () => {
            const spy = jest
                .spyOn(vscode_1.window, 'showInputBox')
                .mockImplementation(jest.fn(() => Promise.resolve(undefined)));
            const fileWriteSpy = jest.spyOn(vscode_1.workspace.fs, 'writeFile');
            await vscode_1.commands.executeCommand('foam-vscode.create-note-from-default-template');
            expect(spy).toBeCalledWith({
                prompt: `Enter a title for the new note`,
                value: 'Title of my New Note',
                validateInput: expect.anything(),
            });
            expect(fileWriteSpy).toHaveBeenCalledTimes(0);
        });
    });
    describe('create-new-template', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should create a new template', async () => {
            const template = path_1.default.join(vscode_1.workspace.workspaceFolders[0].uri.fsPath, '.foam', 'templates', 'hello-world.md');
            vscode_1.window.showInputBox = jest.fn(() => {
                return Promise.resolve(template);
            });
            await vscode_1.commands.executeCommand('foam-vscode.create-new-template');
            const file = await vscode_1.workspace.fs.readFile(vscode_1.Uri.file(template));
            expect(vscode_1.window.showInputBox).toHaveBeenCalled();
            expect(file).toBeDefined();
        });
        it('can be cancelled', async () => {
            // This is the default template which would be created.
            const template = path_1.default.join(vscode_1.workspace.workspaceFolders[0].uri.fsPath, '.foam', 'templates', 'new-template.md');
            vscode_1.window.showInputBox = jest.fn(() => {
                return Promise.resolve(undefined);
            });
            await vscode_1.commands.executeCommand('foam-vscode.create-new-template');
            expect(vscode_1.window.showInputBox).toHaveBeenCalled();
            await expect(vscode_1.workspace.fs.readFile(vscode_1.Uri.file(template))).rejects.toThrow();
        });
    });
});
//# sourceMappingURL=create-from-template.spec.js.map