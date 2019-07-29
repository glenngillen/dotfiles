"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_adapter_1 = require("./index/vscode-adapter");
const logger_1 = require("./logger");
const telemetry_1 = require("./telemetry");
class DefinitionProvider {
    constructor(index) {
        this.index = index;
        this.logger = new logger_1.Logger("definition-provider");
    }
    provideDefinition(document, position) {
        try {
            let [file, group] = this.index.indexDocument(document);
            if (!file || !group)
                return null;
            let reference = group.queryReferences(document.uri, { position: vscode_adapter_1.from_vscode_Position(position) })[0];
            if (!reference)
                return null;
            let section = group.query("ALL_FILES", { id: reference.targetId })[0];
            if (!section)
                return null;
            return vscode_adapter_1.to_vscode_Location(section.location);
        }
        catch (error) {
            this.logger.exception("Could not provide definition", error);
            telemetry_1.Reporter.trackException("provideDefinition", error);
        }
    }
}
exports.DefinitionProvider = DefinitionProvider;

//# sourceMappingURL=definition.js.map
