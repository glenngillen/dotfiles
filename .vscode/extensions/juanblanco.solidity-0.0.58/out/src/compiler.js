'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const fsex = require("fs-extra");
const solcCompiler_1 = require("./solcCompiler");
const solErrorsToDiaganosticsClient_1 = require("./solErrorsToDiaganosticsClient");
function outputErrorsToChannel(outputChannel, errors) {
    errors.forEach(error => {
        outputChannel.appendLine(error.formattedMessage);
    });
    outputChannel.show();
}
function compile(contracts, diagnosticCollection, buildDir, rootDir, sourceDir, excludePath, singleContractFilePath) {
    // Did we find any sol files after all?
    if (Object.keys(contracts).length === 0) {
        vscode.window.showWarningMessage('No solidity files (*.sol) found');
        return;
    }
    const solc = new solcCompiler_1.SolcCompiler(vscode.workspace.rootPath);
    const outputChannel = vscode.window.createOutputChannel('solidity compilation');
    outputChannel.clear();
    outputChannel.show();
    vscode.window.setStatusBarMessage('Compilation started');
    const remoteCompiler = vscode.workspace.getConfiguration('solidity').get('compileUsingRemoteVersion');
    const localCompiler = vscode.workspace.getConfiguration('solidity').get('compileUsingLocalVersion');
    return new Promise((resolve, reject) => {
        solc.intialiseCompiler(localCompiler, remoteCompiler).then(() => {
            const output = solc.compile(JSON.stringify(contracts));
            if (solc.currentCompilerType === solcCompiler_1.compilerType.localFile) {
                outputChannel.appendLine("Compiling using local file: '" + solc.currentCompilerSetting + "', solidity version: " + solc.getVersion());
            }
            if (solc.currentCompilerType === solcCompiler_1.compilerType.localNode) {
                outputChannel.appendLine('Compiling using solidity from node_modules, solidity version: ' + solc.getVersion());
            }
            if (solc.currentCompilerType === solcCompiler_1.compilerType.Remote) {
                outputChannel.appendLine("Compiling using remote version: '" + solc.currentCompilerSetting + "', solidity version: " + solc.getVersion());
            }
            if (solc.currentCompilerType === solcCompiler_1.compilerType.default) {
                outputChannel.appendLine('Compiling using default compiler, solidity version: ' + solc.getVersion());
            }
            resolve(processCompilationOutput(output, outputChannel, diagnosticCollection, buildDir, sourceDir, excludePath, singleContractFilePath));
        }).catch((reason) => {
            vscode.window.showWarningMessage(reason);
            reject(reason);
        });
    });
}
exports.compile = compile;
function processCompilationOutput(outputString, outputChannel, diagnosticCollection, buildDir, sourceDir, excludePath, singleContractFilePath) {
    const output = JSON.parse(outputString);
    if (Object.keys(output).length === 0) {
        const noOutputMessage = `No output by the compiler`;
        vscode.window.showWarningMessage(noOutputMessage);
        vscode.window.setStatusBarMessage(noOutputMessage);
        outputChannel.appendLine(noOutputMessage);
        return;
    }
    diagnosticCollection.clear();
    if (output.errors) {
        const errorWarningCounts = solErrorsToDiaganosticsClient_1.errorsToDiagnostics(diagnosticCollection, output.errors);
        outputErrorsToChannel(outputChannel, output.errors);
        if (errorWarningCounts.errors > 0) {
            const compilationWithErrorsMessage = `Compilation failed with ${errorWarningCounts.errors} errors`;
            vscode.window.showErrorMessage(compilationWithErrorsMessage);
            vscode.window.setStatusBarMessage(compilationWithErrorsMessage);
            outputChannel.appendLine(compilationWithErrorsMessage);
            if (errorWarningCounts.warnings > 0) {
                vscode.window.showWarningMessage(`Compilation had ${errorWarningCounts.warnings} warnings`);
            }
        }
        else if (errorWarningCounts.warnings > 0) {
            const files = writeCompilationOutputToBuildDirectory(output, buildDir, sourceDir, excludePath, singleContractFilePath);
            const compilationWithWarningsMessage = `Compilation completed successfully!, with ${errorWarningCounts.warnings} warnings`;
            vscode.window.showWarningMessage(compilationWithWarningsMessage);
            vscode.window.setStatusBarMessage(compilationWithWarningsMessage);
            outputChannel.appendLine(compilationWithWarningsMessage);
            return files;
        }
    }
    else {
        const files = writeCompilationOutputToBuildDirectory(output, buildDir, sourceDir, excludePath, singleContractFilePath);
        const compilationSuccessMessage = `Compilation completed successfully!`;
        vscode.window.showInformationMessage(compilationSuccessMessage);
        vscode.window.setStatusBarMessage(compilationSuccessMessage);
        outputChannel.appendLine(compilationSuccessMessage);
        return files;
    }
}
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
function writeCompilationOutputToBuildDirectory(output, buildDir, sourceDir, excludePath, singleContractFilePath) {
    const binPath = path.join(vscode.workspace.rootPath, buildDir);
    const compiledFiles = new Array();
    if (!fs.existsSync(binPath)) {
        fs.mkdirSync(binPath);
    }
    if (typeof singleContractFilePath !== 'undefined' && singleContractFilePath !== null) {
        const relativePath = path.relative(vscode.workspace.rootPath, singleContractFilePath);
        const dirName = path.dirname(path.join(binPath, relativePath));
        const outputCompilationPath = path.join(dirName, path.basename(singleContractFilePath, '.sol') + '-solc-output' + '.json');
        ensureDirectoryExistence(outputCompilationPath);
        fs.writeFileSync(outputCompilationPath, JSON.stringify(output, null, 4));
    }
    else {
        const dirName = binPath;
        const outputCompilationPath = path.join(dirName, 'solc-output-compile-all' + '.json');
        ensureDirectoryExistence(outputCompilationPath);
        if (fs.existsSync(outputCompilationPath)) {
            fs.unlinkSync(outputCompilationPath);
        }
        fs.writeFileSync(outputCompilationPath, JSON.stringify(output, null, 4));
    }
    // iterate through all the sources,
    // find contracts and output them into the same folder structure to avoid collisions, named as the contract
    for (const source in output.contracts) {
        // TODO: ALL this validation to a method
        // Output only single contract compilation or all
        if (!singleContractFilePath || source === singleContractFilePath) {
            if (!excludePath || !source.startsWith(excludePath)) {
                // Output only source directory compilation or all (this will exclude external references)
                if (!sourceDir || source.startsWith(sourceDir)) {
                    for (const contractName in output.contracts[source]) {
                        if (output.contracts[source].hasOwnProperty(contractName)) {
                            const contract = output.contracts[source][contractName];
                            const relativePath = path.relative(vscode.workspace.rootPath, source);
                            const dirName = path.dirname(path.join(binPath, relativePath));
                            if (!fs.existsSync(dirName)) {
                                fsex.mkdirsSync(dirName);
                            }
                            const contractAbiPath = path.join(dirName, contractName + '.abi');
                            const contractBinPath = path.join(dirName, contractName + '.bin');
                            const contractJsonPath = path.join(dirName, contractName + '.json');
                            if (fs.existsSync(contractAbiPath)) {
                                fs.unlinkSync(contractAbiPath);
                            }
                            if (fs.existsSync(contractBinPath)) {
                                fs.unlinkSync(contractBinPath);
                            }
                            if (fs.existsSync(contractJsonPath)) {
                                fs.unlinkSync(contractJsonPath);
                            }
                            fs.writeFileSync(contractBinPath, contract.evm.bytecode.object);
                            fs.writeFileSync(contractAbiPath, JSON.stringify(contract.abi));
                            const shortJsonOutput = {
                                contractName: contractName,
                                // tslint:disable-next-line:object-literal-sort-keys
                                abi: contract.abi,
                                metadata: contract.metadata,
                                bytecode: contract.evm.bytecode.object,
                                deployedBytecode: contract.evm.deployedBytecode.object,
                                sourceMap: contract.evm.bytecode.sourceMap,
                                deployedSourceMap: contract.evm.deployedBytecode.sourceMap,
                                sourcePath: source,
                                compiler: {
                                    name: 'solc',
                                    version: JSON.parse(contract.metadata).compiler.version,
                                },
                                ast: output.sources[source].ast,
                                functionHashes: contract.evm.methodIdentifiers,
                                gasEstimates: contract.evm.gasEstimates,
                            };
                            fs.writeFileSync(contractJsonPath, JSON.stringify(shortJsonOutput, null, 4));
                            compiledFiles.push(contractJsonPath);
                        }
                    }
                }
            }
        }
    }
    return compiledFiles;
}
//# sourceMappingURL=compiler.js.map