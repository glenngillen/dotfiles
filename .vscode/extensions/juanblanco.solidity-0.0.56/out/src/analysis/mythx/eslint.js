"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFatal = (fatal, severity) => fatal || severity === 2;
exports.getUniqueMessages = (messages) => {
    const jsonValues = messages.map((m) => JSON.stringify(m));
    const uniuqeValues = jsonValues.reduce((accum, curr) => {
        if (accum.indexOf(curr) === -1) {
            accum.push(curr);
        }
        return accum;
    }, []);
    return uniuqeValues.map(v => JSON.parse(v));
};
exports.calculateErrors = (messages) => messages.reduce((acc, { fatal, severity }) => exports.isFatal(fatal, severity) ? acc + 1 : acc, 0);
exports.calculateWarnings = (messages) => messages.reduce((acc, { fatal, severity }) => !exports.isFatal(fatal, severity) ? acc + 1 : acc, 0);
exports.getUniqueIssues = (issues) => issues.map((_a) => {
    var { messages } = _a, restProps = __rest(_a, ["messages"]);
    const uniqueMessages = exports.getUniqueMessages(messages);
    const warningCount = exports.calculateWarnings(uniqueMessages);
    const errorCount = exports.calculateErrors(uniqueMessages);
    return Object.assign({}, restProps, { errorCount, messages: uniqueMessages, warningCount });
});
module.exports = {
    getUniqueIssues: exports.getUniqueIssues,
    getUniqueMessages: exports.getUniqueMessages,
    isFatal: exports.isFatal,
};
//# sourceMappingURL=eslint.js.map