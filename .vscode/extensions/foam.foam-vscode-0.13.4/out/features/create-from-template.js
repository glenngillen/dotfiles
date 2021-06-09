"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFoamTemplateVariables = exports.substituteFoamVariables = exports.resolveFoamVariables = exports.UserCancelledOperation = void 0;
const vscode_1 = require("vscode");
const path = __importStar(require("path"));
const util_1 = require("util");
const utils_1 = require("../utils");
const fs_1 = require("fs");
const templatesDir = vscode_1.Uri.joinPath(vscode_1.workspace.workspaceFolders[0].uri, '.foam', 'templates');
class UserCancelledOperation extends Error {
    constructor(message) {
        super('UserCancelledOperation');
        if (message) {
            this.message = message;
        }
    }
}
exports.UserCancelledOperation = UserCancelledOperation;
const knownFoamVariables = new Set(['FOAM_TITLE']);
const defaultTemplateDefaultText = '# ${FOAM_TITLE}'; // eslint-disable-line no-template-curly-in-string
const defaultTemplateUri = vscode_1.Uri.joinPath(templatesDir, 'new-note.md');
const templateContent = `# \${1:$TM_FILENAME_BASE}

Welcome to Foam templates.

What you see in the heading is a placeholder
- it allows you to quickly move through positions of the new note by pressing TAB, e.g. to easily fill fields
- a placeholder optionally has a default value, which can be some text or, as in this case, a [variable](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_variables)
  - when landing on a placeholder, the default value is already selected so you can easily replace it
- a placeholder can define a list of values, e.g.: \${2|one,two,three|}
- you can use variables even outside of placeholders, here is today's date: \${CURRENT_YEAR}/\${CURRENT_MONTH}/\${CURRENT_DATE}

For a full list of features see [the VS Code snippets page](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax).

## To get started

1. edit this file to create the shape new notes from this template will look like
2. create a note from this template by running the \`Foam: Create New Note From Template\` command
`;
async function getTemplates() {
    const templates = await vscode_1.workspace.findFiles('.foam/templates/**.md');
    return templates.map(template => path.basename(template.path));
}
async function offerToCreateTemplate() {
    const response = await vscode_1.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'No templates available. Would you like to create one instead?',
    });
    if (response === 'Yes') {
        vscode_1.commands.executeCommand('foam-vscode.create-new-template');
        return;
    }
}
function findFoamVariables(templateText) {
    const regex = /\$(FOAM_[_a-zA-Z0-9]*)|\${(FOAM_[[_a-zA-Z0-9]*)}/g;
    var matches = [];
    const output = [];
    while ((matches = regex.exec(templateText))) {
        output.push(matches[1] || matches[2]);
    }
    const uniqVariables = [...new Set(output)];
    const knownVariables = uniqVariables.filter(x => knownFoamVariables.has(x));
    return knownVariables;
}
async function resolveFoamTitle() {
    const title = await vscode_1.window.showInputBox({
        prompt: `Enter a title for the new note`,
        value: 'Title of my New Note',
        validateInput: value => value.trim().length === 0 ? 'Please enter a title' : undefined,
    });
    if (title === undefined) {
        throw new UserCancelledOperation();
    }
    return title;
}
class Resolver {
    constructor() {
        this.promises = new Map();
    }
    resolve(name, givenValues) {
        if (givenValues.has(name)) {
            this.promises.set(name, Promise.resolve(givenValues.get(name)));
        }
        else if (!this.promises.has(name)) {
            switch (name) {
                case 'FOAM_TITLE':
                    this.promises.set(name, resolveFoamTitle());
                    break;
                default:
                    this.promises.set(name, Promise.resolve(name));
                    break;
            }
        }
        const result = this.promises.get(name);
        return result;
    }
}
async function resolveFoamVariables(variables, givenValues) {
    const resolver = new Resolver();
    const promises = variables.map(async (variable) => Promise.resolve([variable, await resolver.resolve(variable, givenValues)]));
    const results = await Promise.all(promises);
    const valueByName = new Map();
    results.forEach(([variable, value]) => {
        valueByName.set(variable, value);
    });
    return valueByName;
}
exports.resolveFoamVariables = resolveFoamVariables;
function substituteFoamVariables(templateText, givenValues) {
    givenValues.forEach((value, variable) => {
        const regex = new RegExp(
        // Matches a limited subset of the the TextMate variable syntax:
        //  ${VARIABLE}  OR   $VARIABLE
        `\\\${${variable}}|\\$${variable}(\\W|$)`, 
        // The latter is more complicated, since it needs to avoid replacing
        // longer variable names with the values of variables that are
        // substrings of the longer ones (e.g. `$FOO` and `$FOOBAR`. If you
        // replace $FOO first, and aren't careful, you replace the first
        // characters of `$FOOBAR`)
        'g' // 'g' => Global replacement (i.e. not just the first instance)
        );
        templateText = templateText.replace(regex, `${value}$1`);
    });
    return templateText;
}
exports.substituteFoamVariables = substituteFoamVariables;
async function askUserForTemplate() {
    const templates = await getTemplates();
    if (templates.length === 0) {
        return offerToCreateTemplate();
    }
    return await vscode_1.window.showQuickPick(templates, {
        placeHolder: 'Select a template to use.',
    });
}
async function askUserForFilepathConfirmation(defaultFilepath, defaultFilename) {
    return await vscode_1.window.showInputBox({
        prompt: `Enter the filename for the new note`,
        value: defaultFilepath.fsPath,
        valueSelection: [
            defaultFilepath.fsPath.length - defaultFilename.length,
            defaultFilepath.fsPath.length - 3,
        ],
        validateInput: value => value.trim().length === 0
            ? 'Please enter a value'
            : fs_1.existsSync(value)
                ? 'File already exists'
                : undefined,
    });
}
async function resolveFoamTemplateVariables(templateText, extraVariablesToResolve = new Set()) {
    const givenValues = new Map();
    const variables = findFoamVariables(templateText.toString()).concat(...extraVariablesToResolve);
    const uniqVariables = [...new Set(variables)];
    const resolvedValues = await resolveFoamVariables(uniqVariables, givenValues);
    const subbedText = substituteFoamVariables(templateText.toString(), resolvedValues);
    const snippet = new vscode_1.SnippetString(subbedText);
    return [resolvedValues, snippet];
}
exports.resolveFoamTemplateVariables = resolveFoamTemplateVariables;
async function writeTemplate(templateSnippet, filepath) {
    await vscode_1.workspace.fs.writeFile(filepath, new util_1.TextEncoder().encode(''));
    await utils_1.focusNote(filepath, true);
    await vscode_1.window.activeTextEditor.insertSnippet(templateSnippet);
}
function currentDirectoryFilepath(filename) {
    var _a, _b;
    const activeFile = (_b = (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document) === null || _b === void 0 ? void 0 : _b.uri.path;
    const currentDir = activeFile !== undefined
        ? vscode_1.Uri.parse(path.dirname(activeFile))
        : vscode_1.workspace.workspaceFolders[0].uri;
    return vscode_1.Uri.joinPath(currentDir, filename);
}
async function createNoteFromDefaultTemplate() {
    const templateUri = defaultTemplateUri;
    const templateText = fs_1.existsSync(templateUri.fsPath)
        ? await vscode_1.workspace.fs.readFile(templateUri).then(bytes => bytes.toString())
        : defaultTemplateDefaultText;
    let resolvedValues, templateSnippet;
    try {
        [resolvedValues, templateSnippet] = await resolveFoamTemplateVariables(templateText, new Set(['FOAM_TITLE']));
    }
    catch (err) {
        if (err instanceof UserCancelledOperation) {
            return;
        }
        else {
            throw err;
        }
    }
    const defaultSlug = resolvedValues.get('FOAM_TITLE') || 'New Note';
    const defaultFilename = `${defaultSlug}.md`;
    const defaultFilepath = currentDirectoryFilepath(defaultFilename);
    let filepath = defaultFilepath;
    if (fs_1.existsSync(filepath.fsPath)) {
        const newFilepath = await askUserForFilepathConfirmation(defaultFilepath, defaultFilename);
        if (newFilepath === undefined) {
            return;
        }
        filepath = vscode_1.Uri.file(newFilepath);
    }
    await writeTemplate(templateSnippet, filepath);
}
async function createNoteFromTemplate(templateFilename) {
    const selectedTemplate = await askUserForTemplate();
    if (selectedTemplate === undefined) {
        return;
    }
    templateFilename = selectedTemplate;
    const templateUri = vscode_1.Uri.joinPath(templatesDir, templateFilename);
    const templateText = await vscode_1.workspace.fs
        .readFile(templateUri)
        .then(bytes => bytes.toString());
    let resolvedValues, templateSnippet;
    try {
        [resolvedValues, templateSnippet] = await resolveFoamTemplateVariables(templateText);
    }
    catch (err) {
        if (err instanceof UserCancelledOperation) {
            return;
        }
        else {
            throw err;
        }
    }
    const defaultSlug = resolvedValues.get('FOAM_TITLE') || 'New Note';
    const defaultFilename = `${defaultSlug}.md`;
    const defaultFilepath = currentDirectoryFilepath(defaultFilename);
    const filepath = await askUserForFilepathConfirmation(defaultFilepath, defaultFilename);
    if (filepath === undefined) {
        return;
    }
    const filepathURI = vscode_1.Uri.file(filepath);
    await writeTemplate(templateSnippet, filepathURI);
}
async function createNewTemplate() {
    const defaultFilename = 'new-template.md';
    const defaultTemplate = vscode_1.Uri.joinPath(templatesDir, defaultFilename);
    const filename = await vscode_1.window.showInputBox({
        prompt: `Enter the filename for the new template`,
        value: defaultTemplate.fsPath,
        valueSelection: [
            defaultTemplate.fsPath.length - defaultFilename.length,
            defaultTemplate.fsPath.length - 3,
        ],
        validateInput: value => value.trim().length === 0
            ? 'Please enter a value'
            : fs_1.existsSync(value)
                ? 'File already exists'
                : undefined,
    });
    if (filename === undefined) {
        return;
    }
    const filenameURI = vscode_1.Uri.file(filename);
    await vscode_1.workspace.fs.writeFile(filenameURI, new util_1.TextEncoder().encode(templateContent));
    await utils_1.focusNote(filenameURI, false);
}
const feature = {
    activate: (context) => {
        context.subscriptions.push(vscode_1.commands.registerCommand('foam-vscode.create-note-from-template', createNoteFromTemplate));
        context.subscriptions.push(vscode_1.commands.registerCommand('foam-vscode.create-note-from-default-template', createNoteFromDefaultTemplate));
        context.subscriptions.push(vscode_1.commands.registerCommand('foam-vscode.create-new-template', createNewTemplate));
    },
};
exports.default = feature;
//# sourceMappingURL=create-from-template.js.map