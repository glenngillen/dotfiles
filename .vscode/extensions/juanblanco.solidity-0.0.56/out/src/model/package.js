'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class Package {
    constructor(solidityDirectory) {
        this.build_dir = 'bin';
        this.sol_sources = solidityDirectory;
    }
    getSolSourcesAbsolutePath() {
        if (this.sol_sources !== undefined || this.sol_sources === '') {
            return path.join(this.absoluletPath, this.sol_sources);
        }
        return this.absoluletPath;
    }
    isImportForThis(contractDependencyImport) {
        const splitDirectories = contractDependencyImport.split('/');
        if (splitDirectories.length === 1) {
            return false;
        }
        return splitDirectories[0] === this.name;
    }
    resolveImport(contractDependencyImport) {
        if (this.isImportForThis(contractDependencyImport)) {
            return path.join(this.getSolSourcesAbsolutePath(), contractDependencyImport.substring(this.name.length));
        }
        return null;
    }
}
exports.Package = Package;
//# sourceMappingURL=package.js.map