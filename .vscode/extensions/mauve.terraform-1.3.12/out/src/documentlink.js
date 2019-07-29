"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const model_1 = require("./autocompletion/model");
const vscode_adapter_1 = require("./index/vscode-adapter");
const logger_1 = require("./logger");
const telemetry_1 = require("./telemetry");
class DocumentLinkProvider {
    constructor(index) {
        this.index = index;
        this.logger = new logger_1.Logger("document-link-provider");
    }
    provideDocumentLinks(document, token) {
        try {
            let [file, group] = this.index.indexDocument(document);
            if (!file || !group)
                return [];
            return file.sections.map((s) => {
                if (!s.type)
                    return null;
                let doc = model_1.findResourceFormat(s.sectionType, s.type);
                if (!doc)
                    return null;
                return new vscode.DocumentLink(vscode_adapter_1.to_vscode_Range(s.typeLocation.range), vscode.Uri.parse(doc.url));
            }).filter((d) => d != null);
        }
        catch (error) {
            this.logger.exception("Could not provide document links", error);
            telemetry_1.Reporter.trackException("provideDocumentLinks", error);
        }
    }
}
exports.DocumentLinkProvider = DocumentLinkProvider;

//# sourceMappingURL=documentlink.js.map
