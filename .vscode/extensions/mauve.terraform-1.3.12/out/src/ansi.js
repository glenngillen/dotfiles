"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
function stripAnsi(text) {
    return text.replace(ansiRegex, '');
}
exports.stripAnsi = stripAnsi;

//# sourceMappingURL=ansi.js.map
