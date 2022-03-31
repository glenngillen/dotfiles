'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractCollection = void 0;
const fs = require("fs");
const contract_1 = require("./contract");
const util_1 = require("../util");
class ContractCollection {
    constructor() {
        this.contracts = new Array();
    }
    findContract(contract, contractPath) {
        return contract.absolutePath === contractPath;
    }
    containsContract(contractPath) {
        return this.contracts.findIndex((contract) => { return contract.absolutePath === contractPath; }) > -1;
    }
    getDefaultContractsForCompilation(optimizeCompilationRuns = 200) {
        const compilerOutputSelection = {
            '*': {
                '': ['ast'],
                '*': ['abi', 'devdoc', 'userdoc', 'storageLayout', 'metadata', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates'],
            },
        };
        return this.getContractsForCompilation(true, optimizeCompilationRuns, compilerOutputSelection);
    }
    getDefaultContractsForCompilationDiagnostics() {
        const compilerOutputSelection = {
            '*': {
                '': [],
                '*': [],
            },
        };
        return this.getContractsForCompilation(false, 0, compilerOutputSelection);
    }
    getContractsForCompilation(optimizeCompilation, optimizeCompilationRuns, outputSelection) {
        const contractsForCompilation = {};
        this.contracts.forEach(contract => {
            contractsForCompilation[contract.absolutePath] = { content: contract.code };
        });
        const compilation = {
            language: 'Solidity',
            settings: {
                optimizer: {
                    enabled: optimizeCompilation,
                    runs: optimizeCompilationRuns,
                },
                outputSelection: outputSelection,
            },
            sources: contractsForCompilation,
        };
        return compilation;
    }
    addContractAndResolveImports(contractPath, code, project) {
        const contract = this.addContract(contractPath, code);
        if (contract !== null) {
            contract.resolveImports();
            contract.imports.forEach(foundImport => {
                if (fs.existsSync(foundImport)) {
                    if (!this.containsContract(foundImport)) {
                        const importContractCode = this.readContractCode(foundImport);
                        if (importContractCode != null) {
                            this.addContractAndResolveImports(foundImport, importContractCode, project);
                        }
                    }
                }
                else {
                    this.addContractAndResolveDependencyImport(foundImport, contract, project);
                }
            });
        }
        return contract;
    }
    addContract(contractPath, code) {
        if (!this.containsContract(contractPath)) {
            const contract = new contract_1.Contract(contractPath, code);
            this.contracts.push(contract);
            return contract;
        }
        return null;
    }
    formatContractPath(contractPath) {
        return util_1.formatPath(contractPath);
    }
    getAllImportFromPackages() {
        const importsFromPackages = new Array();
        this.contracts.forEach(contract => {
            const contractImports = contract.getAllImportFromPackages();
            contractImports.forEach(contractImport => {
                if (importsFromPackages.indexOf(contractImport) < 0) {
                    importsFromPackages.push(contractImport);
                }
            });
        });
        return importsFromPackages;
    }
    readContractCode(contractPath) {
        if (fs.existsSync(contractPath)) {
            return fs.readFileSync(contractPath, 'utf8');
        }
        return null;
    }
    addContractAndResolveDependencyImport(dependencyImport, contract, project) {
        //find re-mapping
        const remapping = project.findImportRemapping(dependencyImport);
        if (remapping !== undefined) {
            const importPath = this.formatContractPath(remapping.resolveImport(dependencyImport));
            this.addContractAndResolveDependencyImportFromContractFullPath(importPath, project, contract, dependencyImport);
        }
        else {
            const depPack = project.findDependencyPackage(dependencyImport);
            if (depPack !== undefined) {
                const depImportPath = this.formatContractPath(depPack.resolveImport(dependencyImport));
                this.addContractAndResolveDependencyImportFromContractFullPath(depImportPath, project, contract, dependencyImport);
            }
        }
    }
    addContractAndResolveDependencyImportFromContractFullPath(importPath, project, contract, dependencyImport) {
        if (!this.containsContract(importPath)) {
            const importContractCode = this.readContractCode(importPath);
            if (importContractCode != null) {
                this.addContractAndResolveImports(importPath, importContractCode, project);
                contract.replaceDependencyPath(dependencyImport, importPath);
            }
        }
        else {
            contract.replaceDependencyPath(dependencyImport, importPath);
        }
    }
}
exports.ContractCollection = ContractCollection;
//# sourceMappingURL=contractsCollection.js.map