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
const logger_1 = require("./logger");
const telemetry_1 = require("./telemetry");
class CodeFoldingProvider {
    constructor(index) {
        this.index = index;
        this.startMarker = new RegExp("^\\s*#region");
        this.endMarker = new RegExp("^\\s*#endregion");
        this.logger = new logger_1.Logger("folding-provider");
    }
    provideFoldingRanges(document) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let [file, group] = yield this.index.indexDocument(document);
                if (!file)
                    return undefined;
                let ranges = [];
                for (const section of file.sections) {
                    ranges.push(this.sectionToRange(section));
                    for (const property of section.properties) {
                        const range = this.propertyToRange(property);
                        if (range)
                            ranges.push(range);
                    }
                }
                // handle #region #endregion markers
                let regionStart = -1;
                for (let line = 0; line < document.lineCount; line++) {
                    const text = document.lineAt(line);
                    if (regionStart === -1) {
                        if (text.text.match(this.startMarker))
                            regionStart = line;
                    }
                    else {
                        if (text.text.match(this.endMarker)) {
                            ranges.push(new vscode.FoldingRange(regionStart, line, vscode.FoldingRangeKind.Comment));
                            regionStart = -1;
                        }
                    }
                }
                return ranges;
            }
            catch (err) {
                this.logger.exception("Could not provide folding ranges", err);
                telemetry_1.Reporter.trackException("provideFoldingRanges", err);
            }
        });
    }
    locationToLines(location) {
        return [location.range.start.line, location.range.end.line];
    }
    sectionToRange(section) {
        const [start, end] = this.locationToLines(section.location);
        return new vscode.FoldingRange(start, end, vscode.FoldingRangeKind.Region);
    }
    propertyToRange(property) {
        const [start, end] = this.locationToLines(property.valueLocation);
        if (start === end)
            return null;
        return new vscode.FoldingRange(start, end, vscode.FoldingRangeKind.Region);
    }
}
exports.CodeFoldingProvider = CodeFoldingProvider;

//# sourceMappingURL=folding.js.map
