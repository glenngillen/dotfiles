"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDailyNoteIfNotExists = exports.getDailyNoteFileName = exports.getDailyNotePath = exports.openDailyNoteFor = void 0;
const vscode_1 = require("vscode");
const dateformat_1 = __importDefault(require("dateformat"));
const path_1 = require("./core/utils/path");
const utils_1 = require("./utils");
const uri_1 = require("./core/model/uri");
const vsc_utils_1 = require("./utils/vsc-utils");
const templates_1 = require("./services/templates");
/**
 * Open the daily note file.
 *
 * In the case that the daily note file does not exist,
 * it gets created along with any folders in its path.
 *
 * @param date A given date to be formatted as filename.
 */
async function openDailyNoteFor(date) {
    const foamConfiguration = vscode_1.workspace.getConfiguration('foam');
    const currentDate = date instanceof Date ? date : new Date();
    const dailyNotePath = getDailyNotePath(foamConfiguration, currentDate);
    const isNew = await createDailyNoteIfNotExists(foamConfiguration, dailyNotePath, currentDate);
    // if a new file is created, the editor is automatically created
    // but forcing the focus will block the template placeholders from working
    // so we only explicitly focus on the note if the file already exists
    if (!isNew) {
        await utils_1.focusNote(dailyNotePath, isNew);
    }
}
exports.openDailyNoteFor = openDailyNoteFor;
/**
 * Get the daily note file path.
 *
 * This function first checks the `foam.openDailyNote.directory` configuration string,
 * defaulting to the current directory.
 *
 * In the case that the directory path is not absolute,
 * the resulting path will start on the current workspace top-level.
 *
 * @param configuration The current workspace configuration.
 * @param date A given date to be formatted as filename.
 * @returns The path to the daily note file.
 */
function getDailyNotePath(configuration, date) {
    var _a;
    const dailyNoteDirectory = uri_1.URI.file((_a = configuration.get('openDailyNote.directory')) !== null && _a !== void 0 ? _a : '.');
    const dailyNoteFilename = getDailyNoteFileName(configuration, date);
    if (dailyNoteDirectory.isAbsolute()) {
        return dailyNoteDirectory.joinPath(dailyNoteFilename);
    }
    else {
        return vsc_utils_1.fromVsCodeUri(vscode_1.workspace.workspaceFolders[0].uri).joinPath(dailyNoteDirectory.path, dailyNoteFilename);
    }
}
exports.getDailyNotePath = getDailyNotePath;
/**
 * Get the daily note filename (basename) to use.
 *
 * Fetch the filename format and extension from
 * `foam.openDailyNote.filenameFormat` and
 * `foam.openDailyNote.fileExtension`, respectively.
 *
 * @param configuration The current workspace configuration.
 * @param date A given date to be formatted as filename.
 * @returns The daily note's filename.
 */
function getDailyNoteFileName(configuration, date) {
    const filenameFormat = configuration.get('openDailyNote.filenameFormat');
    const fileExtension = configuration.get('openDailyNote.fileExtension');
    return `${dateformat_1.default(date, filenameFormat, false)}.${fileExtension}`;
}
exports.getDailyNoteFileName = getDailyNoteFileName;
/**
 * Create a daily note if it does not exist.
 *
 * In the case that the folders referenced in the file path also do not exist,
 * this function will create all folders in the path.
 *
 * @param configuration The current workspace configuration.
 * @param dailyNotePath The path to daily note file.
 * @param currentDate The current date, to be used as a title.
 * @returns Wether the file was created.
 */
async function createDailyNoteIfNotExists(configuration, dailyNotePath, targetDate) {
    var _a;
    if (await path_1.existsInFs(dailyNotePath.toFsPath())) {
        return false;
    }
    const titleFormat = (_a = configuration.get('openDailyNote.titleFormat')) !== null && _a !== void 0 ? _a : configuration.get('openDailyNote.filenameFormat');
    const templateFallbackText = `---
foam_template:
  name: New Daily Note
  description: Foam's default daily note template
---
# ${dateformat_1.default(targetDate, titleFormat, false)}
`;
    await templates_1.NoteFactory.createFromDailyNoteTemplate(dailyNotePath, templateFallbackText, targetDate);
    return true;
}
exports.createDailyNoteIfNotExists = createDailyNoteIfNotExists;
//# sourceMappingURL=dated-notes.js.map