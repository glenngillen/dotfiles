"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
const micromatch = require("micromatch");
const child_process_1 = require("child_process");
const dash_1 = require("./dash");
const os_1 = require("os");
const OS = os_1.platform();
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand('extension.dash.specific', () => {
        searchSpecific();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('extension.dash.all', () => {
        searchAll();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('extension.dash.emptySyntax', () => {
        searchEmptySyntax();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('extension.dash.customSyntax', () => {
        searchCustomWithSyntax();
    }));
}
exports.activate = activate;
/**
 * Search in dash for selection syntax documentation
 */
function searchSpecific() {
    const editor = getEditor();
    const query = getSelectedText(editor);
    const docsets = getDocsets();
    const dash = new dash_1.Dash(OS, getDashOption());
    child_process_1.exec(dash.getCommand(query, docsets));
}
/**
 * Search in dash for all documentation
 */
function searchAll() {
    const editor = getEditor();
    const query = getSelectedText(editor);
    const dash = new dash_1.Dash(OS, getDashOption());
    child_process_1.exec(dash.getCommand(query));
}
/**
 * Search in dash for editor syntax documentation
 */
function searchEmptySyntax() {
    const query = '';
    const docsets = getDocsets();
    const dash = new dash_1.Dash(OS, getDashOption());
    child_process_1.exec(dash.getCommand(query, docsets));
}
/**
 * Search in dash for editor syntax documentation with a custom query
 */
function searchCustomWithSyntax() {
    const docsets = getDocsets();
    const dash = new dash_1.Dash(OS, getDashOption());
    const inputOptions = {
        placeHolder: 'Something to search in Dash.',
        prompt: 'Enter something to search for in Dash.',
    };
    vscode_1.window.showInputBox(inputOptions).then(query => {
        if (query) {
            // If they actually input code
            child_process_1.exec(dash.getCommand(query, docsets)); // Open it in dash
        }
    });
}
/**
 * Get vscode active editor
 *
 * @return {TextEditor}
 */
function getEditor() {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        return;
    }
    return editor;
}
/**
 * Get selected text by selection or by cursor position
 *
 * @param {TextEditor} active editor
 * @return {string}
 */
function getSelectedText(editor) {
    const selection = editor.selection;
    let text = editor.document.getText(selection);
    if (!text) {
        const range = editor.document.getWordRangeAtPosition(selection.active);
        text = editor.document.getText(range);
    }
    return text;
}
/**
 * Get docset configuration
 *
 * @param {string} languageId e.g javascript, ruby
 * @return {string}
 */
function getDocsets() {
    const editor = getEditor();
    const fileName = path.basename(editor.document.fileName);
    const languageId = editor.document.languageId;
    const fileNameDocsets = getFileNameDocsets(fileName);
    const languageIdDocsets = getLanguageIdDocsets(languageId);
    // prioritize docset matching by file name then language id
    return [...fileNameDocsets, ...languageIdDocsets];
}
/**
 * Get docsets based on file name
 * @param {string} fileName
 * @return {string}
 */
function getFileNameDocsets(fileName) {
    const fileNameConfig = vscode_1.workspace.getConfiguration('dash.fileNameToDocsetMap');
    const matchedFileNameConfigKey = Object.keys(fileNameConfig).find(config => micromatch.isMatch(fileName, config));
    return matchedFileNameConfigKey
        ? fileNameConfig[matchedFileNameConfigKey]
        : [];
}
/**
 * Get docsets based on languge id
 * @param languageId
 * @return {string}
 */
function getLanguageIdDocsets(languageId) {
    const languageIdConfig = vscode_1.workspace.getConfiguration('dash.languageIdToDocsetMap');
    return languageIdConfig[languageId] || [];
}
function getDashOption() {
    const exactDocset = vscode_1.workspace
        .getConfiguration('dash')
        .get('exactDocset');
    return {
        exactDocset,
    };
}
