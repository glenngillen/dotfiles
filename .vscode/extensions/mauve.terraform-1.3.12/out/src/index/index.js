"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("./group");
;
;
class Index {
    constructor() {
        this._groups = new Map();
    }
    get groups() {
        return [...this._groups.values()];
    }
    clear() {
        this._groups.forEach(g => g.clear());
        this._groups.clear();
    }
    /// Returns the group with the specified Uri
    group(uri) {
        const s = uri.toString();
        return this._groups.get(s);
    }
    /// Returns the group to which the specified uri would belong
    groupFor(uri) {
        return this.groups.find(g => g.belongs(uri));
    }
    add(file) {
        let group = this.group(group_1.dirname(file.uri));
        if (!group) {
            group = group_1.IndexGroup.createFromFileIndex(file);
            this._groups.set(group.uri.toString(), group);
        }
        else {
            group.add(file);
        }
        return group;
    }
    delete(uri) {
        let group = this.groupFor(uri);
        if (!group)
            return group;
        group.delete(uri);
        if (group.fileCount === 0) {
            // remove empty group
            this._groups.delete(group.uri.toString());
        }
    }
}
exports.Index = Index;

//# sourceMappingURL=index.js.map
