"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TerraformVersion {
    constructor(major, minor, micro, development) {
        this.major = major;
        this.minor = minor;
        this.micro = micro;
        this.development = development;
        this.version = major * 1000000 + minor * 10000 + micro * 10;
        // sort non-dev builds higher than dev builds of the same version
        if (!this.development)
            this.sort = this.version + 1;
        else
            this.sort = this.version;
    }
    // parse output of `terraform -version`
    static parse(versionInfo) {
        const firstLine = versionInfo.split('\n', 1)[0];
        if (!firstLine)
            return null;
        // example:
        //   Terraform v0.11.8-dev (2487af19453a0d55a428fb17150f87b24170ccc1+CHANGES)
        // but we ignore the part after -dev
        const match = firstLine.match(/^Terraform v([0-9]+)\.([0-9]+)\.([0-9]+)(-dev)?/);
        if (!match)
            return null;
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        const micro = parseInt(match[3], 10);
        const development = match[4] === "-dev";
        return new TerraformVersion(major, minor, micro, development);
    }
    toString() {
        return `${this.major}.${this.minor}.${this.micro}${this.development ? '-dev' : ''}`;
    }
    static compare(left, right, options) {
        if (!options)
            options = { ignoreDevelopment: false };
        if (!left)
            return -1;
        if (!right)
            return 0;
        if (left.sort < right.sort)
            return -1;
        if (left.sort > right.sort)
            return 1;
        return 0;
    }
}
exports.TerraformVersion = TerraformVersion;
var ConstraintOperator;
(function (ConstraintOperator) {
    ConstraintOperator["Equal"] = "=";
    ConstraintOperator["NotEqual"] = "!=";
    ConstraintOperator["GreaterThan"] = ">";
    ConstraintOperator["LessThan"] = "<";
    ConstraintOperator["GreaterThanEqual"] = ">=";
    ConstraintOperator["LessThanEqual"] = "<=";
    ConstraintOperator["Pessimistic"] = "~>";
})(ConstraintOperator = exports.ConstraintOperator || (exports.ConstraintOperator = {}));
;
class VersionConstraint {
    constructor(operator, major, minor, micro) {
        this.operator = operator;
        this.major = major;
        this.minor = minor;
        this.micro = micro;
    }
    static parse(constraint) {
        const match = constraint.match(/\s*([!=<>~]{1,2})?\s*([0-9]+)\.([0-9]+)(\.([0-9]+))?\s*/);
        if (!match)
            throw new Error(`Cannot parse version constraint '${constraint}'`);
        const operator = match[1] ? VersionConstraint.parseOperator(match[1]) : ConstraintOperator.Equal;
        if (!operator)
            throw new Error(`Invalid version constraint operator '${match[1]}'`);
        const major = parseInt(match[2], 10);
        const minor = parseInt(match[3], 10);
        const micro = match[5] ? parseInt(match[5], 10) : undefined;
        return new VersionConstraint(operator, major, minor, micro);
    }
    get version() {
        const micro = this.micro === undefined ? 0 : this.micro;
        return this.major * 1000000 + this.minor * 10000 + micro * 10;
    }
    isFulfilledBy(version) {
        switch (this.operator) {
            case ConstraintOperator.Equal:
                return this.version === version.version;
            case ConstraintOperator.NotEqual:
                return this.version !== version.version;
            case ConstraintOperator.GreaterThan:
                return version.version > this.version;
            case ConstraintOperator.GreaterThanEqual:
                return version.version >= this.version;
            case ConstraintOperator.LessThan:
                return version.version < this.version;
            case ConstraintOperator.LessThanEqual:
                return version.version <= this.version;
            case ConstraintOperator.Pessimistic: {
                let nextVersion;
                if (this.micro !== undefined) {
                    nextVersion = this.major * 1000000 + (this.minor + 1) * 10000 + 0 * 10;
                }
                else {
                    nextVersion = (this.major + 1) * 1000000;
                }
                return version.version >= this.version && version.version < nextVersion;
            }
        }
        return false;
    }
    toString() {
        const versionString = [this.major, this.minor, this.micro].filter(c => c !== undefined).join('.');
        return `${this.operator} ${versionString}`;
    }
    static parseOperator(input) {
        switch (input) {
            case "":
            case "=": return ConstraintOperator.Equal;
            case "!=": return ConstraintOperator.NotEqual;
            case "<": return ConstraintOperator.LessThan;
            case ">": return ConstraintOperator.GreaterThan;
            case "<=": return ConstraintOperator.LessThanEqual;
            case ">=": return ConstraintOperator.GreaterThanEqual;
            case "~>": return ConstraintOperator.Pessimistic;
        }
        return;
    }
}
exports.VersionConstraint = VersionConstraint;
class VersionRequirement {
    constructor(constraints) {
        this.constraints = constraints;
    }
    static parse(input) {
        const parts = input.split(',');
        return new VersionRequirement(parts.map(VersionConstraint.parse));
    }
    isFulfilledBy(version) {
        return this.constraints.every(c => c.isFulfilledBy(version));
    }
    failedConstraints(version) {
        return this.constraints.filter(c => !c.isFulfilledBy(version));
    }
}
exports.VersionRequirement = VersionRequirement;

//# sourceMappingURL=version.js.map
