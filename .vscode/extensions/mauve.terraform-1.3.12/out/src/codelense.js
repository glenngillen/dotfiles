"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const logger_1 = require("./logger");
const telemetry_1 = require("./telemetry");
class SectionReferenceCodeLens extends vscode.CodeLens {
    constructor(group, range, section, command) {
        super(range, command);
        this.group = group;
        this.section = section;
    }
    createCommand() {
        let references = this.group.queryReferences("ALL_FILES", { target: this.section });
        return {
            title: `${references.length} references`,
            command: 'terraform.showReferences',
            tooltip: `Show all references to ${this.section.id}`,
            arguments: [this.section]
        };
    }
}
exports.SectionReferenceCodeLens = SectionReferenceCodeLens;
class CodeLensProvider {
    constructor(index) {
        this.index = index;
        this.logger = new logger_1.Logger("code-lens-provider");
    }
    provideCodeLenses(document, token) {
        try {
            let [file, group] = this.index.indexDocument(document);
            if (!file)
                return [];
            return file.sections.filter((s) => s.sectionType !== "provider").map((s) => {
                let firstLineOfSection = document.lineAt(s.location.range.start.line).range;
                return new SectionReferenceCodeLens(group, firstLineOfSection, s);
            });
        }
        catch (error) {
            this.logger.exception("Could not provide code lenses", error);
            telemetry_1.Reporter.trackException("provideCodeLenses", error);
            return [];
        }
    }
    resolveCodeLens(codeLens, token) {
        try {
            let sectionReferenceCodeLens = codeLens;
            sectionReferenceCodeLens.command = sectionReferenceCodeLens.createCommand();
            return sectionReferenceCodeLens;
        }
        catch (error) {
            this.logger.exception("Could not resolve code lens", error);
            telemetry_1.Reporter.trackException("resolveCodeLens", error);
        }
    }
}
exports.CodeLensProvider = CodeLensProvider;

//# sourceMappingURL=codelense.js.map
