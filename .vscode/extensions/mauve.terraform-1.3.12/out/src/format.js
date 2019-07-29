"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configuration_1 = require("./configuration");
const logger_1 = require("./logger");
class FormattingEditProvider {
    constructor(runner) {
        this.runner = runner;
        this.logger = new logger_1.Logger("formatting-provider");
    }
    isFormatEnabled(document) {
        const ignoreExtensionsOnSave = configuration_1.getConfiguration().format.ignoreExtensionsOnSave || [];
        return ignoreExtensionsOnSave.map((ext) => {
            return document.fileName.endsWith(ext);
        }).indexOf(true) === -1;
    }
    provideDocumentFormattingEdits(document, options, token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.isFormatEnabled(document)) {
                    return [];
                }
                const fullRange = doc => doc.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
                const range = fullRange(document);
                this.logger.info(`running 'terraform fmt' on '${document.fileName}'`);
                let formattedText = yield this.runner.run({
                    input: document.getText(),
                }, "fmt", "-");
                return [new vscode.TextEdit(range, formattedText)];
            }
            catch (error) {
                this.logger.exception("formatting failed.", error);
            }
        });
    }
}
exports.FormattingEditProvider = FormattingEditProvider;

//# sourceMappingURL=format.js.map
