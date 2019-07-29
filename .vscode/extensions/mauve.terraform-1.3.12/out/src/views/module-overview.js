"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ast_1 = require("../index/ast");
class ModuleOverview extends vscode.Disposable {
    constructor(index) {
        super(() => this.dispose());
        this.index = index;
        this.disposables = [];
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.disposables.push(this.index.onDidChange((e) => this.onIndexDidChange(e)));
    }
    dispose() {
        this._onDidChangeTreeData.dispose();
        this.disposables.forEach(d => d.dispose());
    }
    get onDidChangeTreeData() {
        return this._onDidChangeTreeData.event;
    }
    onIndexDidChange(e) {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        switch (element.type) {
            case "MODULE":
                return this.groupToTreeItem(element.group);
            case "SECTION":
                return this.sectionToTreeItem(element.section);
            case "PROPERTY":
                return this.propertyToTreeItem(element.property);
            case "SECTION_GROUP":
                return this.sectionGroupToTreeItem(element);
            case "LABEL":
                return this.labelToTreeItem(element);
        }
    }
    getChildren(element) {
        if (!element) {
            return this.index.index.groups.map(g => {
                return {
                    type: "MODULE",
                    group: g
                };
            });
        }
        switch (element.type) {
            case "MODULE": {
                return [
                    {
                        type: "LABEL",
                        label: `Terraform version requirement: ${element.group.requiredVersion || "no requirement"}`
                    },
                    {
                        type: "SECTION_GROUP",
                        group: element.group,
                        label: "Providers",
                        query: { section_type: "provider" }
                    },
                    {
                        type: "SECTION_GROUP",
                        group: element.group,
                        label: "Variables",
                        query: { section_type: "variable" }
                    },
                    {
                        type: "SECTION_GROUP",
                        group: element.group,
                        label: "Resources and Data",
                        query: { section_type: { type: "EXACT", match: ["resource", "data"] } }
                    },
                    {
                        type: "SECTION_GROUP",
                        group: element.group,
                        label: "Outputs",
                        query: { section_type: "output" }
                    }
                ];
            }
            case "SECTION_GROUP": {
                return element.group.query("ALL_FILES", element.query).map(s => {
                    return {
                        type: "SECTION",
                        section: s
                    };
                });
            }
            case "SECTION": {
                return element.section.properties.map(p => {
                    return {
                        type: "PROPERTY",
                        property: p
                    };
                });
            }
            case "PROPERTY": {
                if (typeof element.property.value === "string")
                    return [];
                return element.property.value.map(p => {
                    return {
                        type: "PROPERTY",
                        property: p
                    };
                });
            }
        }
    }
    sectionToTreeItem(section) {
        let item = {
            label: section.label,
            id: section.id(),
            collapsibleState: section.properties.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        };
        if (section.sectionType === "variable") {
            let defaultProperty = section.getProperty("default");
            if (defaultProperty && ast_1.getValueType(defaultProperty.node.Val) === ast_1.AstValueType.String) {
                item.tooltip = `default value: ${defaultProperty.value}`;
            }
        }
        return item;
    }
    groupToTreeItem(group) {
        // asRelativePath returns false when the tested uri is
        // the same as a workspace folder so we need to handle that
        // case separately
        const workspaceFolders = vscode.workspace.workspaceFolders || [];
        const folder = workspaceFolders.find(f => f.uri.fsPath === group.uri.fsPath);
        let label = folder ? folder.name : vscode.workspace.asRelativePath(group.uri);
        return {
            label: label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            id: group.uri.toString(),
            iconPath: vscode.ThemeIcon.Folder
        };
    }
    propertyToTreeItem(property) {
        if (typeof property.value === "string") {
            return {
                label: `${property.name}: ${property.value}`
            };
        }
        else {
            return {
                label: property.name,
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
            };
        }
    }
    sectionGroupToTreeItem(node) {
        return {
            label: node.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
        };
    }
    labelToTreeItem(node) {
        return {
            label: node.label
        };
    }
}
exports.ModuleOverview = ModuleOverview;

//# sourceMappingURL=module-overview.js.map
