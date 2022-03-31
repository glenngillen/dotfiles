'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.importRemappingArray = exports.importRemappings = exports.Remapping = void 0;
const path = require("path");
class Remapping {
    isImportForThis(contractDependencyImport) {
        if (this.context !== undefined) {
            return contractDependencyImport.startsWith(this.context + ":" + this.prefix);
        }
        return contractDependencyImport.startsWith(this.prefix);
    }
    resolveImport(contractDependencyImport) {
        const validImport = this.isImportForThis(contractDependencyImport);
        if (validImport && this.context == undefined) {
            return path.join(this.basePath, this.target, contractDependencyImport.substring(this.prefix.length));
        }
        if (validImport && this.context !== undefined) {
            return path.join(this.basePath, this.target, contractDependencyImport.substring((this.context + ":" + this.prefix).length));
        }
        return null;
    }
}
exports.Remapping = Remapping;
function importRemappings(remappings, project) {
    const remappingArray = remappings.split(/\r\n|\r|\n/); //split lines
    return importRemappingArray(remappingArray, project);
}
exports.importRemappings = importRemappings;
function importRemappingArray(remappings, project) {
    const remappingsList = new Array();
    if (remappings !== undefined && remappings.length > 0) {
        remappings.forEach(remappingElement => {
            const remapping = new Remapping();
            //TODO / NOTE modules should be matched to packages paths
            remapping.basePath = project.projectPackage.absoluletPath;
            if (remappingElement.indexOf(':') > -1) {
                const contextAndRemapping = remappingElement.split(':');
                remapping.context = contextAndRemapping[0];
                remappingElement = contextAndRemapping[1];
            }
            if (remappingElement.indexOf('=') > -1) {
                const prefixAndTarget = remappingElement.split('=');
                remapping.prefix = prefixAndTarget[0];
                remapping.target = prefixAndTarget[1];
                remappingsList.push(remapping);
            }
        });
    }
    return remappingsList;
}
exports.importRemappingArray = importRemappingArray;
//# sourceMappingURL=remapping.js.map