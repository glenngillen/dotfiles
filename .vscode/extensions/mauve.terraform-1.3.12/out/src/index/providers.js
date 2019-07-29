"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const logger_1 = require("../logger");
const telemetry_1 = require("../telemetry");
const vscode_adapter_1 = require("./vscode-adapter");
class ReferenceProvider {
    constructor(index) {
        this.index = index;
        this.logger = new logger_1.Logger("reference-provider");
    }
    provideReferences(document, position, context) {
        try {
            let [file, group] = this.index.indexDocument(document);
            if (!file || !group)
                return [];
            let section = group.query(document.uri, { position: vscode_adapter_1.from_vscode_Position(position) })[0];
            if (!section)
                return [];
            let references = group.queryReferences("ALL_FILES", { target: section });
            return references.map((r) => {
                const range = new vscode.Range(r.location.range.start.line, r.location.range.start.character, r.location.range.end.line, r.location.range.end.character);
                return new vscode.Location(r.location.uri, range);
            });
        }
        catch (error) {
            this.logger.exception("Could not provide references", error);
            telemetry_1.Reporter.trackException("provideReferences", error);
            return [];
        }
    }
}
exports.ReferenceProvider = ReferenceProvider;
function createDocumentSymbolFromProperty(p) {
    const nameRange = vscode_adapter_1.to_vscode_Range(p.nameLocation.range);
    const valueRange = vscode_adapter_1.to_vscode_Range(p.valueLocation.range);
    const fullRange = nameRange.union(valueRange);
    if (typeof p.value === "string") {
        return new vscode.DocumentSymbol(p.name, p.value, vscode.SymbolKind.Property, fullRange, nameRange);
    }
    else {
        let symbol = new vscode.DocumentSymbol(p.name, "", vscode.SymbolKind.Namespace, fullRange, nameRange);
        symbol.children = p.value.map((c) => createDocumentSymbolFromProperty(c));
        return symbol;
    }
}
function createDocumentSymbol(s) {
    const range = vscode_adapter_1.to_vscode_Range(s.location.range);
    const selectionRange = vscode_adapter_1.to_vscode_Range(s.nameLocation.range);
    const detail = [s.sectionType, s.type].filter((f) => !!f).join(".");
    let symbol = new vscode.DocumentSymbol(s.name, detail, getKind(s.sectionType), range, selectionRange);
    symbol.children = s.properties.map((p) => createDocumentSymbolFromProperty(p));
    // to look at those stupid icons
    // for (let kind = vscode.SymbolKind.File; kind <= vscode.SymbolKind.TypeParameter; kind ++) {
    //   symbol.children.push(new vscode.DocumentSymbol(`${kind}`, `${kind}`, kind, range, selectionRange));
    // }
    return symbol;
}
function createSymbolInfo(s) {
    const location = vscode_adapter_1.to_vscode_Location(s.location);
    const detail = [s.sectionType, s.type].filter((f) => !!f).join(".");
    return new vscode.SymbolInformation(s.name, getKind(s.sectionType), detail, location);
}
function getKind(sectionType) {
    switch (sectionType) {
        case "resource": return vscode.SymbolKind.Class;
        case "output": return vscode.SymbolKind.Property;
        case "variable": return vscode.SymbolKind.Variable;
        case "local": return vscode.SymbolKind.Variable;
        case "data": return vscode.SymbolKind.String;
    }
    return null;
}
class DocumentSymbolProvider {
    constructor(index) {
        this.index = index;
        this.logger = new logger_1.Logger("document-symbol-provider");
    }
    provideDocumentSymbols(document) {
        try {
            let [file, group] = this.index.indexDocument(document);
            if (!file || !group)
                return [];
            const sections = group.query(document.uri);
            const symbols = sections.map((s) => createDocumentSymbol(s));
            telemetry_1.Reporter.trackEvent("provideDocumentSymbols", {}, { symbolCount: symbols.length });
            return symbols;
        }
        catch (err) {
            this.logger.exception("Could not provide document symbols", err);
            telemetry_1.Reporter.trackException("provideDocumentSymbols", err);
            return [];
        }
    }
}
exports.DocumentSymbolProvider = DocumentSymbolProvider;
class WorkspaceSymbolProvider {
    constructor(index) {
        this.index = index;
        this.logger = new logger_1.Logger("workspace-symbol-provider");
    }
    provideWorkspaceSymbols(query) {
        try {
            let groups = this.index.index.groups;
            const sections = Array().concat(...groups.map(g => g.query("ALL_FILES", { id: { type: "FUZZY", match: query } })));
            const symbols = sections.map((s) => createSymbolInfo(s));
            telemetry_1.Reporter.trackEvent("provideWorkspaceSymbols", {}, { symbolCount: symbols.length });
            return symbols;
        }
        catch (err) {
            this.logger.exception(`Could not provide workspace symbols (query: ${query})`, err);
            telemetry_1.Reporter.trackException("provideWorkspaceSymbols", err);
            return [];
        }
    }
}
exports.WorkspaceSymbolProvider = WorkspaceSymbolProvider;

//# sourceMappingURL=providers.js.map
