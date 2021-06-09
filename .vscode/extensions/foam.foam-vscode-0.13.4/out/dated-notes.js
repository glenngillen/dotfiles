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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyNotePath = exports.createDailyNoteIfNotExists = exports.getDailyNoteFileName = exports.openDailyNoteFor = void 0;
const vscode_1 = require("vscode");
const dateformat_1 = __importDefault(require("dateformat"));
const fs = __importStar(require("fs"));
const path_1 = require("path");
const utils_1 = require("./utils");
const foam_core_1 = require("foam-core");
async function openDailyNoteFor(date) {
    const foamConfiguration = vscode_1.workspace.getConfiguration('foam');
    const currentDate = date !== undefined ? date : new Date();
    const dailyNotePath = getDailyNotePath(foamConfiguration, currentDate);
    const isNew = await createDailyNoteIfNotExists(foamConfiguration, dailyNotePath, currentDate);
    await utils_1.focusNote(dailyNotePath, isNew);
}
exports.openDailyNoteFor = openDailyNoteFor;
function getDailyNotePath(configuration, date) {
    var _a;
    const dailyNoteDirectory = (_a = configuration.get('openDailyNote.directory')) !== null && _a !== void 0 ? _a : '.';
    const dailyNoteFilename = getDailyNoteFileName(configuration, date);
    if (path_1.isAbsolute(dailyNoteDirectory)) {
        return foam_core_1.URI.joinPath(vscode_1.Uri.file(dailyNoteDirectory), dailyNoteFilename);
    }
    else {
        return foam_core_1.URI.joinPath(vscode_1.workspace.workspaceFolders[0].uri, dailyNoteDirectory, dailyNoteFilename);
    }
}
exports.getDailyNotePath = getDailyNotePath;
function getDailyNoteFileName(configuration, date) {
    const filenameFormat = configuration.get('openDailyNote.filenameFormat');
    const fileExtension = configuration.get('openDailyNote.fileExtension');
    return `${dateformat_1.default(date, filenameFormat, false)}.${fileExtension}`;
}
exports.getDailyNoteFileName = getDailyNoteFileName;
async function createDailyNoteIfNotExists(configuration, dailyNotePath, currentDate) {
    var _a;
    if (await utils_1.pathExists(dailyNotePath)) {
        return false;
    }
    await createDailyNoteDirectoryIfNotExists(dailyNotePath);
    const titleFormat = (_a = configuration.get('openDailyNote.titleFormat')) !== null && _a !== void 0 ? _a : configuration.get('openDailyNote.filenameFormat');
    await fs.promises.writeFile(foam_core_1.URI.toFsPath(dailyNotePath), `# ${dateformat_1.default(currentDate, titleFormat, false)}${utils_1.docConfig.eol}${utils_1.docConfig.eol}`);
    return true;
}
exports.createDailyNoteIfNotExists = createDailyNoteIfNotExists;
async function createDailyNoteDirectoryIfNotExists(dailyNotePath) {
    const dailyNoteDirectory = foam_core_1.URI.getDir(dailyNotePath);
    if (!(await utils_1.pathExists(dailyNoteDirectory))) {
        await fs.promises.mkdir(foam_core_1.URI.toFsPath(dailyNoteDirectory), {
            recursive: true,
        });
    }
}
//# sourceMappingURL=dated-notes.js.map