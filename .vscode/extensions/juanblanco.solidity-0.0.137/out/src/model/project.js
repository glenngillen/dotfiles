'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const remapping_1 = require("./remapping");
class Project {
    constructor(projectPackage, dependencies, packagesDir, remappings) {
        this.projectPackage = projectPackage;
        this.dependencies = dependencies;
        this.packagesDir = packagesDir;
        this.remappings = remapping_1.importRemappingArray(remappings, this);
    }
    // This will need to add the current package as a parameter to resolve version dependencies
    findDependencyPackage(contractDependencyImport) {
        return this.dependencies.find((depPack) => depPack.isImportForThis(contractDependencyImport));
    }
    findImportRemapping(contractDependencyImport) {
        //const remappings = importRemappings("@openzeppelin/=lib/openzeppelin-contracts//\r\nds-test/=lib/ds-test/src/", this);
        return this.remappings.find(x => x.isImportForThis(contractDependencyImport));
    }
}
exports.Project = Project;
//# sourceMappingURL=project.js.map