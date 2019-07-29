"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_index_1 = require("../../src/index/file-index");
function dirname(uri) {
    return uri.with({
        path: uri.path.substr(0, uri.path.lastIndexOf('/'))
    });
}
exports.dirname = dirname;
class IndexGroup {
    constructor(uri) {
        this.uri = uri;
        this.files = new Map();
        this.sections = new Map();
    }
    static createFromFileIndex(index) {
        let dir = dirname(index.uri);
        let group = new IndexGroup(dir);
        group.add(index);
        return group;
    }
    get fileCount() {
        return this.files.size;
    }
    get sectionCount() {
        return this.sections.size;
    }
    belongs(uri) {
        return this.uri.toString() === dirname(uri).toString() ||
            this.uri.toString() === uri.toString();
    }
    add(index) {
        if (!this.belongs(index.uri))
            throw new Error(`Invalid index for group (${this.uri}): ${index.uri.toString()}`);
        this.files.set(index.uri.toString(), index);
        index.sections.forEach(s => this.sections.set(s.id(), s));
    }
    get(uri) {
        return this.files.get(uri.toString());
    }
    delete(uriOrFileIndex) {
        const uri = uriOrFileIndex instanceof file_index_1.FileIndex ? uriOrFileIndex.uri : uriOrFileIndex;
        let index = this.get(uri);
        if (!index)
            return;
        index.sections.forEach(s => this.sections.delete(s.id()));
        this.files.delete(uri.toString());
    }
    clear() {
        this.files.clear();
        this.sections.clear();
    }
    query(uri, options) {
        if (options && (options.name_position || options.position) && uri === "ALL_FILES") {
            throw "Cannot use ALL_FILES when querying for position or name_position";
        }
        let uris = uri === "ALL_FILES" ? [...this.files.keys()] : [uri.toString()];
        let indices = uris.map((u) => this.files.get(u)).filter((i) => i != null);
        let sections = indices.reduce((a, i) => a.concat(...i.query(options)), new Array());
        if (options && options.unique) {
            return sections.filter((section, index, self) => {
                return self.findIndex((other) => other.id() === section.id()) === index;
            });
        }
        return sections;
    }
    queryReferences(uri, options) {
        if (options.position && uri === "ALL_FILES") {
            throw "Cannot use ALL_FILES when querying for position";
        }
        return [].concat(...this.indices(uri).map((f) => [...f.queryReferences(options)]));
    }
    indices(uri) {
        if (uri === "ALL_FILES")
            return [...this.files.values()];
        else {
            const index = this.get(uri);
            if (!index)
                return [];
            return [index];
        }
    }
    section(id) {
        return this.sections.get(id);
    }
    get terraformSections() {
        return this.indices("ALL_FILES").map(f => f.terraform).filter(f => !!f);
    }
    get requiredVersion() {
        return this.terraformSections.map(f => f.requiredVersion).find(v => !!v);
    }
}
exports.IndexGroup = IndexGroup;

//# sourceMappingURL=group.js.map
