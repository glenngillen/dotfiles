"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Property {
    constructor(name, nameLocation, value, valueLocation, node) {
        this.name = name;
        this.nameLocation = nameLocation;
        this.value = value;
        this.valueLocation = valueLocation;
        this.node = node;
    }
    toString(defaultValue = "") {
        if (typeof this.value !== "string")
            return defaultValue;
        return this.value;
    }
    getProperty(...name) {
        if (name.length === 0)
            return null;
        return this.getPropertyRecursive(name[0], name.slice(1));
    }
    getPropertyRecursive(first, remaining) {
        if (typeof this.value === "string")
            return null;
        const property = this.value.find(p => p.name === first);
        if (!property)
            return null;
        if (remaining.length === 0)
            return property;
        return property.getPropertyRecursive(remaining[0], remaining.slice(1));
    }
}
exports.Property = Property;
;

//# sourceMappingURL=property.js.map
