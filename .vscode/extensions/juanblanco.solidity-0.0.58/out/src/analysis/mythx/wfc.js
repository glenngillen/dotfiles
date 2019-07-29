"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
   This is largely a cut and paste of truffle-workflow-compile

   We have modified it though to save additional information per contract
   to assist MythX analysis.

   In particular we add:
     sourceList[]  - a list of the sources that can be used in a sourceMap.
     sources       - a dict whose key is an entry of sourceList and whose value contains
         source: string
         ast: ast
         legacyAst: ast
*/
const mkdirp = require("mkdirp");
const path = require("path");
const fs = require("fs-extra");
const util_1 = require("util");
const Config = require("truffle-config");
const truffle_compile_1 = require("./compat/truffle-compile");
const externalCompile = require("truffle-external-compile");
const expect = require("truffle-expect");
const Resolver = require("truffle-resolver");
const Artifactor = require("truffle-artifactor");
const OS = require("os");
const SUPPORTED_COMPILERS = {
    'external': externalCompile,
    'solc': truffle_compile_1.default,
};
/* A replacement for truffe-artifacts.save, that
   puts in only MythX-needed fields.
*/
const mythXsave = function (object) {
    const self = this;
    return new Promise(function (accept, reject) {
        if (object.contractName == null) {
            return reject(new Error('You must specify a contract name.'));
        }
        delete object.contract_name;
        let outputPath = object.contractName;
        // Create new path off of destination.
        outputPath = path.join(self.destination, outputPath);
        outputPath = path.resolve(outputPath);
        // Add json extension.
        outputPath = outputPath + '.json';
        fs.readFile(outputPath, { encoding: 'utf8' }, function (err, json) {
            // No need to handle the error. If the file doesn't exist then we'll start afresh
            // with a new object.
            const finalObject = object;
            if (!err) {
                try {
                    JSON.parse(json);
                }
                catch (e) {
                    reject(e);
                }
                /*
                // normalize existing and merge into final
                finalObject = Schema.normalize(existingObjDirty);

                // merge networks
                var finalNetworks = {};
                _.merge(finalNetworks, finalObject.networks, object.networks);

                // update existing with new
                _.assign(finalObject, object);
                finalObject.networks = finalNetworks;
                */
            }
            // update timestamp
            finalObject.updatedAt = new Date().toISOString();
            // output object
            fs.outputFile(outputPath, JSON.stringify(finalObject, null, 2), 'utf8', function (outErr) {
                if (outErr) {
                    return reject(outErr);
                }
                accept();
            });
        });
    });
};
/* FIXME: if truffle-worflow-compile added a parameter, a directory name
   under "build", we wouldn't have to change this.
*/
function prepareConfig(options) {
    expect.options(options, [
        'build_mythx_contracts',
    ]);
    // Use a config object to ensure we get the default sources.
    const config = Config.default().merge(options);
    if (!config.resolver) {
        config.resolver = new Resolver(config);
    }
    if (!config.artifactor) {
        config.artifactor = new Artifactor(config.build_mythx_contracts);
        config.artifactor.save = mythXsave;
    }
    return config;
}
/*
  This function is not modified from truffle-workflow-compile.
*/
function multiPromisify(func) {
    // FIXME: accumulating this to a list is weird.
    const resultList = [];
    return (...args) => new Promise((accept, reject) => {
        const callback = (err, ...results) => {
            if (err) {
                reject(err);
                return;
            }
            resultList.push(results);
            accept(resultList);
        };
        func(...args, callback);
    });
}
const Contracts = {
    // contracts_directory: String. Directory where .sol files can be found.
    // contracts_build_mythx_contracts: String. Directory where .sol.js files can be found and written to.
    // all: Boolean. Compile all sources found. Defaults to true. If false, will compare sources against built files
    //      in the build directory to see what needs to be compiled.
    // quiet: Boolean. Suppress output. Defaults to false.
    // strict: Boolean. Return compiler warnings as errors. Defaults to false.
    compile: util_1.callbackify(function (options) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = prepareConfig(options);
            // FIXME: Simplify by removing vyper right now.
            delete config.compilers.vyper;
            const compilers = (config.compiler)
                ? [config.compiler]
                : Object.keys(config.compilers);
            // convert to promise to compile+write
            const compilations = yield this.compileSources(config, compilers);
            const collect = (comps) => __awaiter(this, void 0, void 0, function* () {
                const result = {
                    basenames: {},
                    outputs: {},
                };
                for (const compilation of comps) {
                    const { compiler, artifacts } = compilation;
                    if (artifacts) {
                        result.outputs[compiler] = artifacts;
                        for (const artifact of artifacts) {
                            for (const [basename, abstraction] of Object.entries(artifact)) {
                                result.basenames[basename] = abstraction;
                            }
                        }
                    }
                }
                return result;
            });
            return yield collect(compilations);
        });
    }),
    compileSources: function (config, compilers) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(compilers.map((compiler) => __awaiter(this, void 0, void 0, function* () {
                const compile = SUPPORTED_COMPILERS[compiler];
                if (!compile) {
                    throw new Error('Unsupported compiler: ' + compiler);
                }
                const compileFunc = (config.all === true || config.compileAll === true)
                    ? compile.all
                    : compile.necessary;
                const results = yield multiPromisify(compileFunc)(config);
                if (results && results.length > 0) {
                    let seenStale = false;
                    for (const result of results) {
                        const [artifact, stale] = result;
                        if (stale) {
                            if (config.quiet !== true && config.quietWrite !== true && !seenStale) {
                                const relPath = path.relative(config.working_directory, config.build_mythx_contracts);
                                config.logger.log(`Writing artifacts to .${path.sep}${relPath}${OS.EOL}`);
                                seenStale = true;
                            }
                            yield this.writeContracts(artifact, config);
                        }
                    }
                }
                return { compiler, results };
            })));
        });
    },
    writeContracts: function (artifact, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield util_1.promisify(mkdirp)(options.build_mythx_contracts);
            const shortNames = Object.keys(artifact);
            yield Promise.all(shortNames.map((shortName) => __awaiter(this, void 0, void 0, function* () {
                const jsonData = JSON.stringify(artifact[shortName], null, 4);
                const jsonPath = path.join(options.build_mythx_contracts, shortName + '.json');
                return yield util_1.promisify(fs.writeFile)(jsonPath, jsonData);
            })));
        });
    },
};
exports.default = Contracts;
//# sourceMappingURL=wfc.js.map