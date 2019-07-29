"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = require("./build");
const diagnostic_1 = require("./diagnostic");
const hcl_hil_1 = require("./hcl-hil");
const position_1 = require("./position");
const range_1 = require("./range");
class TerraformSection {
    constructor(requiredVersion, requirement, location, node) {
        this.requiredVersion = requiredVersion;
        this.requirement = requirement;
    }
}
exports.TerraformSection = TerraformSection;
class FileIndex {
    constructor(uri) {
        this.uri = uri;
        this.sections = [];
        this.assignments = [];
        this.diagnostics = [];
    }
    add(section) {
        this.sections.push(section);
    }
    *query(options) {
        for (let s of this.sections)
            if (s.match(options))
                yield s;
    }
    *queryReferences(options) {
        for (let s of this.sections) {
            for (let r of s.references) {
                if (r.match(options))
                    yield r;
            }
        }
        for (let a of this.assignments) {
            if (a.match(options))
                yield a;
        }
    }
    static fromString(uri, source) {
        let [ast, error] = hcl_hil_1.parseHcl(source);
        let index = ast ? build_1.build(uri, ast) : null;
        if (error) {
            let range = new range_1.Range(new position_1.Position(error.line, error.column), new position_1.Position(error.line, 300));
            let message = error.message === "" ? "Parse error" : error.message;
            let diagnostic = new diagnostic_1.Diagnostic(range, message, diagnostic_1.DiagnosticSeverity.ERROR);
            return [index, diagnostic];
        }
        return [index, null];
    }
}
exports.FileIndex = FileIndex;

//# sourceMappingURL=file-index.js.map
