"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matcher_1 = require("../matcher");
const property_1 = require("./property");
class Section {
    constructor(sectionType, type, typeLocation, name, nameLocation, location, node, properties) {
        this.references = [];
        this.sectionType = sectionType;
        this.type = type;
        this.typeLocation = typeLocation;
        this.name = name;
        this.nameLocation = nameLocation;
        this.location = location;
        this.node = node;
        this.rootProperty = new property_1.Property(null, null, properties, null, null);
    }
    get properties() {
        return this.rootProperty.value;
    }
    get label() {
        return [this.type, this.name].filter(n => !!n).join('.');
    }
    getProperty(...name) {
        return this.rootProperty.getProperty(...name);
    }
    getStringProperty(name, defaultValue = "") {
        const p = this.getProperty(name);
        if (!p)
            return defaultValue;
        return p.toString();
    }
    match(options) {
        if (!options)
            return true;
        if (options.id) {
            if (!matcher_1.match(this.id(), options.id, "EXACT"))
                return false;
        }
        if (options.section_type)
            if (!matcher_1.match(this.sectionType, options.section_type, "EXACT"))
                return false;
        if (this.type) {
            if (options.type && !matcher_1.match(this.type, options.type))
                return false;
        }
        else {
            if (options.type)
                return false;
        }
        if (options.name) {
            if (!matcher_1.match(this.name, options.name))
                return false;
        }
        if (options.name_position && !this.nameLocation.range.contains(options.name_position))
            return false;
        if (options.position && !this.location.range.contains(options.position))
            return false;
        return true;
    }
    id(rename) {
        let name = rename || this.name;
        if (this.sectionType === "variable") {
            return `var.${name}`;
        }
        if (this.sectionType === "local") {
            return `local.${name}`;
        }
        if (this.sectionType === "module") {
            return `module.${name}`;
        }
        if (this.sectionType === "data")
            return [this.sectionType, this.type, name].join(".");
        if (this.sectionType === "output")
            return this.name;
        return [this.type, name].filter(f => !!f).join(".");
    }
}
exports.Section = Section;

//# sourceMappingURL=section.js.map
