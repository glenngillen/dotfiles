"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineNewNoteFilepath = exports.createTemplate = exports.NoteFactory = exports.getTemplates = exports.getTemplateMetadata = exports.DAILY_NOTE_TEMPLATE_URI = exports.DEFAULT_TEMPLATE_URI = exports.TEMPLATES_DIR = void 0;
const uri_1 = require("../core/model/uri");
const fs_1 = require("fs");
const util_1 = require("util");
const vscode_1 = require("vscode");
const utils_1 = require("../utils");
const vsc_utils_1 = require("../utils/vsc-utils");
const template_frontmatter_parser_1 = require("../utils/template-frontmatter-parser");
const errors_1 = require("./errors");
const editor_1 = require("./editor");
const variable_resolver_1 = require("./variable-resolver");
/**
 * The templates directory
 */
exports.TEMPLATES_DIR = vsc_utils_1.fromVsCodeUri(vscode_1.workspace.workspaceFolders[0].uri).joinPath('.foam', 'templates');
/**
 * The URI of the default template
 */
exports.DEFAULT_TEMPLATE_URI = exports.TEMPLATES_DIR.joinPath('new-note.md');
/**
 * The URI of the template for daily notes
 */
exports.DAILY_NOTE_TEMPLATE_URI = exports.TEMPLATES_DIR.joinPath('daily-note.md');
const WIKILINK_DEFAULT_TEMPLATE_TEXT = `# $\{1:$FOAM_TITLE}\n\n$0`;
const TEMPLATE_CONTENT = `# \${1:$TM_FILENAME_BASE}

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
async function getTemplateMetadata(templateUri) {
    const contents = await vscode_1.workspace.fs
        .readFile(vsc_utils_1.toVsCodeUri(templateUri))
        .then(bytes => bytes.toString());
    const [templateMetadata] = template_frontmatter_parser_1.extractFoamTemplateFrontmatterMetadata(contents);
    return templateMetadata;
}
exports.getTemplateMetadata = getTemplateMetadata;
async function getTemplates() {
    const templates = await vscode_1.workspace
        .findFiles('.foam/templates/**.md', null)
        .then(v => v.map(uri => vsc_utils_1.fromVsCodeUri(uri)));
    return templates;
}
exports.getTemplates = getTemplates;
exports.NoteFactory = {
    /**
     * Creates a new note using a template.
     * @param templateUri the URI of the template to use.
     * @param resolver the Resolver to use.
     * @param filepathFallbackURI the URI to use if the template does not specify the `filepath` metadata attribute. This is configurable by the caller for backwards compatibility purposes.
     * @param templateFallbackText the template text to use if the template does not exist. This is configurable by the caller for backwards compatibility purposes.
     */
    createFromTemplate: async (templateUri, resolver, filepathFallbackURI, templateFallbackText = '') => {
        const templateText = fs_1.existsSync(templateUri.toFsPath())
            ? await vscode_1.workspace.fs
                .readFile(vsc_utils_1.toVsCodeUri(templateUri))
                .then(bytes => bytes.toString())
            : templateFallbackText;
        const selectedContent = editor_1.findSelectionContent();
        if (selectedContent === null || selectedContent === void 0 ? void 0 : selectedContent.content) {
            resolver.define('FOAM_SELECTED_TEXT', selectedContent === null || selectedContent === void 0 ? void 0 : selectedContent.content);
        }
        let templateWithResolvedVariables;
        try {
            templateWithResolvedVariables = await resolver.resolveText(templateText);
        }
        catch (err) {
            if (err instanceof errors_1.UserCancelledOperation) {
                return;
            }
            throw err;
        }
        const [templateMetadata, templateWithFoamFrontmatterRemoved,] = template_frontmatter_parser_1.extractFoamTemplateFrontmatterMetadata(templateWithResolvedVariables);
        const templateSnippet = new vscode_1.SnippetString(templateWithFoamFrontmatterRemoved);
        let filepath = await determineNewNoteFilepath(templateMetadata.get('filepath'), filepathFallbackURI, resolver);
        if (fs_1.existsSync(filepath.toFsPath())) {
            const filename = filepath.getBasename();
            const newFilepath = await askUserForFilepathConfirmation(filepath, filename);
            if (newFilepath === undefined) {
                return;
            }
            filepath = uri_1.URI.file(newFilepath);
        }
        await editor_1.createDocAndFocus(templateSnippet, filepath, selectedContent ? vscode_1.ViewColumn.Beside : vscode_1.ViewColumn.Active);
        if (selectedContent !== undefined) {
            const newNoteTitle = filepath.getName();
            await editor_1.replaceSelection(selectedContent.document, selectedContent.selection, `[[${newNoteTitle}]]`);
        }
    },
    /**
     * Creates a daily note from the daily note template.
     * @param filepathFallbackURI the URI to use if the template does not specify the `filepath` metadata attribute. This is configurable by the caller for backwards compatibility purposes.
     * @param templateFallbackText the template text to use if daily-note.md template does not exist. This is configurable by the caller for backwards compatibility purposes.
     */
    createFromDailyNoteTemplate: (filepathFallbackURI, templateFallbackText, targetDate) => {
        const resolver = new variable_resolver_1.Resolver(new Map(), targetDate);
        return exports.NoteFactory.createFromTemplate(exports.DAILY_NOTE_TEMPLATE_URI, resolver, filepathFallbackURI, templateFallbackText);
    },
    /**
     * Creates a new note when following a placeholder wikilink using the default template.
     * @param wikilinkPlaceholder the placeholder value from the wikilink. (eg. `[[Hello Joe]]` -> `Hello Joe`)
     * @param filepathFallbackURI the URI to use if the template does not specify the `filepath` metadata attribute. This is configurable by the caller for backwards compatibility purposes.
     */
    createForPlaceholderWikilink: (wikilinkPlaceholder, filepathFallbackURI) => {
        const resolver = new variable_resolver_1.Resolver(new Map().set('FOAM_TITLE', wikilinkPlaceholder), new Date());
        return exports.NoteFactory.createFromTemplate(exports.DEFAULT_TEMPLATE_URI, resolver, filepathFallbackURI, WIKILINK_DEFAULT_TEMPLATE_TEXT);
    },
};
exports.createTemplate = async () => {
    const defaultFilename = 'new-template.md';
    const defaultTemplate = exports.TEMPLATES_DIR.joinPath(defaultFilename);
    const fsPath = defaultTemplate.toFsPath();
    const filename = await vscode_1.window.showInputBox({
        prompt: `Enter the filename for the new template`,
        value: fsPath,
        valueSelection: [fsPath.length - defaultFilename.length, fsPath.length - 3],
        validateInput: value => value.trim().length === 0
            ? 'Please enter a value'
            : fs_1.existsSync(value)
                ? 'File already exists'
                : undefined,
    });
    if (filename === undefined) {
        return;
    }
    const filenameURI = uri_1.URI.file(filename);
    await vscode_1.workspace.fs.writeFile(vsc_utils_1.toVsCodeUri(filenameURI), new util_1.TextEncoder().encode(TEMPLATE_CONTENT));
    await utils_1.focusNote(filenameURI, false);
};
async function askUserForFilepathConfirmation(defaultFilepath, defaultFilename) {
    const fsPath = defaultFilepath.toFsPath();
    return await vscode_1.window.showInputBox({
        prompt: `Enter the filename for the new note`,
        value: fsPath,
        valueSelection: [fsPath.length - defaultFilename.length, fsPath.length - 3],
        validateInput: value => value.trim().length === 0
            ? 'Please enter a value'
            : fs_1.existsSync(value)
                ? 'File already exists'
                : undefined,
    });
}
async function determineNewNoteFilepath(templateFilepathAttribute, fallbackURI, resolver) {
    if (templateFilepathAttribute) {
        let defaultFilepath = uri_1.URI.file(templateFilepathAttribute);
        if (!defaultFilepath.isAbsolute()) {
            defaultFilepath = vsc_utils_1.fromVsCodeUri(vscode_1.workspace.workspaceFolders[0].uri).joinPath(templateFilepathAttribute);
        }
        return defaultFilepath;
    }
    if (fallbackURI) {
        return fallbackURI;
    }
    const defaultName = await resolver.resolveFromName('FOAM_TITLE');
    const defaultFilepath = editor_1.getCurrentEditorDirectory().joinPath(`${defaultName}.md`);
    return defaultFilepath;
}
exports.determineNewNoteFilepath = determineNewNoteFilepath;
//# sourceMappingURL=templates.js.map