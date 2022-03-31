"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripImages = exports.stripFrontMatter = exports.getExcerpt = exports.formatSimpleTooltip = exports.formatMarkdownTooltip = exports.getNoteTooltip = exports.getContainsTooltip = exports.focusNote = exports.isNone = exports.isSome = exports.toTitleCase = exports.removeBrackets = exports.getText = exports.hasEmptyTrailing = exports.detectGeneratedCode = exports.isMdEditor = exports.loadDocConfig = exports.mdDocSelector = exports.docConfig = void 0;
const vscode_1 = require("vscode");
const gray_matter_1 = __importDefault(require("gray-matter"));
const remove_markdown_1 = __importDefault(require("remove-markdown"));
const vsc_utils_1 = require("./utils/vsc-utils");
const log_1 = require("./core/utils/log");
exports.docConfig = { tab: '  ', eol: '\r\n' };
exports.mdDocSelector = [
    { language: 'markdown', scheme: 'file' },
    { language: 'markdown', scheme: 'untitled' },
];
function loadDocConfig() {
    // Load workspace config
    const activeEditor = vscode_1.window.activeTextEditor;
    if (!activeEditor) {
        log_1.Logger.debug('Failed to load config, no active editor');
        return;
    }
    exports.docConfig.eol = activeEditor.document.eol === vscode_1.EndOfLine.CRLF ? '\r\n' : '\n';
    const tabSize = Number(activeEditor.options.tabSize);
    const insertSpaces = activeEditor.options.insertSpaces;
    if (insertSpaces) {
        exports.docConfig.tab = ' '.repeat(tabSize);
    }
    else {
        exports.docConfig.tab = '\t';
    }
}
exports.loadDocConfig = loadDocConfig;
function isMdEditor(editor) {
    return editor && editor.document && editor.document.languageId === 'markdown';
}
exports.isMdEditor = isMdEditor;
function detectGeneratedCode(fullText, header, footer) {
    const lines = fullText.split(exports.docConfig.eol);
    const headerLine = lines.findIndex(line => line === header);
    const footerLine = lines.findIndex(line => line === footer);
    if (headerLine < 0 || headerLine >= footerLine) {
        return {
            range: null,
            lines: [],
        };
    }
    return {
        range: new vscode_1.Range(new vscode_1.Position(headerLine, 0), new vscode_1.Position(footerLine, lines[footerLine].length + 1)),
        lines: lines.slice(headerLine + 1, footerLine + 1),
    };
}
exports.detectGeneratedCode = detectGeneratedCode;
function hasEmptyTrailing(doc) {
    return doc.lineAt(doc.lineCount - 1).isEmptyOrWhitespace;
}
exports.hasEmptyTrailing = hasEmptyTrailing;
function getText(range) {
    return vscode_1.window.activeTextEditor.document.getText(range);
}
exports.getText = getText;
/**
 * Used for the "Copy to Clipboard Without Brackets" command
 *
 */
function removeBrackets(s) {
    // take in the string, split on space
    const stringSplitBySpace = s.split(' ');
    // loop through words
    const modifiedWords = stringSplitBySpace.map(currentWord => {
        if (currentWord.includes('[[')) {
            // all of these transformations will turn this "[[you-are-awesome]]"
            // to this "you are awesome"
            let word = currentWord.replace(/(\[\[)/g, '');
            word = word.replace(/(\]\])/g, '');
            word = word.replace(/(.mdx|.md|.markdown)/g, '');
            word = word.replace(/[-]/g, ' ');
            // then we titlecase the word so "you are awesome"
            // becomes "You Are Awesome"
            const titleCasedWord = toTitleCase(word);
            return titleCasedWord;
        }
        return currentWord;
    });
    return modifiedWords.join(' ');
}
exports.removeBrackets = removeBrackets;
/**
 * Takes in a string and returns it titlecased
 *
 * @example toTitleCase("hello world") -> "Hello World"
 */
function toTitleCase(word) {
    return word
        .split(' ')
        .map(word => word[0].toUpperCase() + word.substring(1))
        .join(' ');
}
exports.toTitleCase = toTitleCase;
/**
 * Verify the given object is defined
 *
 * @param value The object to verify
 */
function isSome(value) {
    //
    return value != null;
}
exports.isSome = isSome;
/**
 * Verify the given object is not defined
 *
 * @param value The object to verify
 */
function isNone(value) {
    return value == null;
}
exports.isNone = isNone;
async function focusNote(notePath, moveCursorToEnd, viewColumn = vscode_1.ViewColumn.Active) {
    const document = await vscode_1.workspace.openTextDocument(vsc_utils_1.toVsCodeUri(notePath));
    const editor = await vscode_1.window.showTextDocument(document, viewColumn);
    // Move the cursor to end of the file
    if (moveCursorToEnd) {
        const { lineCount } = editor.document;
        const { range } = editor.document.lineAt(lineCount - 1);
        editor.selection = new vscode_1.Selection(range.end, range.end);
    }
}
exports.focusNote = focusNote;
function getContainsTooltip(titles) {
    const TITLES_LIMIT = 5;
    const ellipsis = titles.length > TITLES_LIMIT ? ',...' : '';
    return `Contains "${titles.slice(0, TITLES_LIMIT).join('", "')}"${ellipsis}`;
}
exports.getContainsTooltip = getContainsTooltip;
/**
 * Depending on the current vscode version, returns a MarkdownString of the
 * note content casted as string or returns a simple string
 * MarkdownString is only available from 1.52.1 onwards
 * https://code.visualstudio.com/updates/v1_52#_markdown-tree-tooltip-api
 * @param note A Foam Note
 */
function getNoteTooltip(content) {
    const STABLE_MARKDOWN_STRING_API_VERSION = '1.52.1';
    const strippedContent = stripFrontMatter(stripImages(content));
    if (vscode_1.version >= STABLE_MARKDOWN_STRING_API_VERSION) {
        return formatMarkdownTooltip(strippedContent);
    }
    return formatSimpleTooltip(strippedContent);
}
exports.getNoteTooltip = getNoteTooltip;
function formatMarkdownTooltip(content) {
    const LINES_LIMIT = 16;
    const { excerpt, lines } = getExcerpt(content, LINES_LIMIT);
    const totalLines = content.split('\n').length;
    const diffLines = totalLines - lines;
    const ellipsis = diffLines > 0 ? `\n\n[...] *(+ ${diffLines} lines)*` : '';
    const md = new vscode_1.MarkdownString(`${excerpt}${ellipsis}`);
    md.isTrusted = true;
    return md;
}
exports.formatMarkdownTooltip = formatMarkdownTooltip;
function formatSimpleTooltip(content) {
    const CHARACTERS_LIMIT = 200;
    const flatContent = remove_markdown_1.default(content)
        .replace(/\r?\n|\r/g, ' ')
        .replace(/\s+/g, ' ');
    const extract = flatContent.substr(0, CHARACTERS_LIMIT);
    const ellipsis = flatContent.length > CHARACTERS_LIMIT ? '...' : '';
    return `${extract}${ellipsis}`;
}
exports.formatSimpleTooltip = formatSimpleTooltip;
function getExcerpt(markdown, maxLines) {
    const OFFSET_LINES_LIMIT = 5;
    const paragraphs = markdown.replace(/\r\n/g, '\n').split('\n\n');
    const excerpt = [];
    let lines = 0;
    for (const paragraph of paragraphs) {
        const n = paragraph.split('\n').length;
        if (lines > maxLines || lines + n - maxLines > OFFSET_LINES_LIMIT) {
            break;
        }
        excerpt.push(paragraph);
        lines = lines + n + 1;
    }
    return { excerpt: excerpt.join('\n\n'), lines };
}
exports.getExcerpt = getExcerpt;
function stripFrontMatter(markdown) {
    return gray_matter_1.default(markdown).content.trim();
}
exports.stripFrontMatter = stripFrontMatter;
function stripImages(markdown) {
    return markdown.replace(/!\[(.*)\]\([-/\\.A-Za-z]*\)/gi, '$1'.length ? '[Image: $1]' : '');
}
exports.stripImages = stripImages;
//# sourceMappingURL=utils.js.map