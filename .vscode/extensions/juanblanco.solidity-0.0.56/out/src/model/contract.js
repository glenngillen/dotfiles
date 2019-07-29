'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util_1 = require("../util");
class Contract {
    constructor(absoulePath, code) {
        this.absolutePath = this.formatContractPath(absoulePath);
        this.code = code;
        this.imports = new Array();
    }
    getAllImportFromPackages() {
        const importsFromPackages = new Array();
        this.imports.forEach(importElement => {
            if (!this.isImportLocal(importElement)) {
                importsFromPackages.push(importElement);
            }
        });
        return importsFromPackages;
    }
    isImportLocal(importPath) {
        return importPath.startsWith('.');
    }
    formatContractPath(contractPath) {
        return util_1.formatPath(contractPath);
    }
    replaceDependencyPath(importPath, depImportAbsolutePath) {
        const importRegEx = /(^\s?import\s+[^'"]*['"])(.*)(['"]\s*)/gm;
        this.code = this.code.replace(importRegEx, (match, p1, p2, p3) => {
            if (p2 === importPath) {
                return p1 + depImportAbsolutePath + p3;
            }
            else {
                return match;
            }
        });
    }
    resolveImports() {
        const importRegEx = /^\s?import\s+[^'"]*['"](.*)['"]\s*/gm;
        let foundImport = importRegEx.exec(this.code);
        while (foundImport != null) {
            const importPath = foundImport[1];
            if (this.isImportLocal(importPath)) {
                const importFullPath = this.formatContractPath(path.resolve(path.dirname(this.absolutePath), foundImport[1]));
                this.imports.push(importFullPath);
            }
            else {
                this.imports.push(importPath);
            }
            foundImport = importRegEx.exec(this.code);
        }
    }
}
exports.Contract = Contract;
//# sourceMappingURL=contract.js.map