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
        let foundRemappings = [];
        this.remappings.forEach(element => {
            if (element.isImportForThis(contractDependencyImport)) {
                foundRemappings.push(element);
            }
        });
        if (foundRemappings.length > 0) {
            return this.sortByLength(foundRemappings)[foundRemappings.length - 1];
        }
        return null;
    }
    findRemappingForFile(filePath) {
        let foundRemappings = [];
        this.remappings.forEach(element => {
            if (element.isFileForThis(filePath)) {
                foundRemappings.push(element);
            }
        });
        if (foundRemappings.length > 0) {
            return this.sortByLength(foundRemappings)[foundRemappings.length - 1];
        }
        return null;
    }
    sortByLength(array) {
        return array.sort(function (a, b) {
            return a.length - b.length;
        });
    }
}
exports.Project = Project;
//# sourceMappingURL=project.js.map