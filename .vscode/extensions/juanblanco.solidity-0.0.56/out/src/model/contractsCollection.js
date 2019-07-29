'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
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
    getContractsForCompilation() {
        const contractsForCompilation = {};
        this.contracts.forEach(contract => {
            contractsForCompilation[contract.absolutePath] = { content: contract.code };
        });
        const compilation = {
            language: 'Solidity',
            settings: {
                optimizer: {
                    enabled: true,
                    // TODO: Make all settings configurable
                    // Optimize for how many times you intend to run the code.
                    // Lower values will optimize more for initial deployment cost, higher values will optimize more for high-frequency usage.
                    runs: 200,
                },
                outputSelection: {
                    '*': {
                        '': ['ast'],
                        '*': ['abi', 'devdoc', 'userdoc', 'metadata', 'evm.bytecode', 'evm.methodIdentifiers', 'evm.gasEstimates'],
                    },
                },
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
        const depPack = project.findPackage(dependencyImport);
        if (depPack !== undefined) {
            const depImportPath = this.formatContractPath(depPack.resolveImport(dependencyImport));
            if (!this.containsContract(depImportPath)) {
                const importContractCode = this.readContractCode(depImportPath);
                if (importContractCode != null) {
                    this.addContractAndResolveImports(depImportPath, importContractCode, project);
                    contract.replaceDependencyPath(dependencyImport, depImportPath);
                }
            }
            else {
                contract.replaceDependencyPath(dependencyImport, depImportPath);
            }
        }
    }
}
exports.ContractCollection = ContractCollection;
//# sourceMappingURL=contractsCollection.js.map