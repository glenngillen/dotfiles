"use strict";
// Compares .sol files to their .sol.js counterparts,
// determines which .sol files have been updated.
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const async = require("async");
const fs = require("fs");
const Parser = require("./parser");
const compilerSupplier_1 = require("./compilerSupplier");
const expect = require("truffle-expect");
const find_contracts = require("truffle-contract-sources");
const Debug = require("debug");
const debug = Debug('compile:profile"'); // eslint-disable-line no-unused-vars
exports.updated = (options, callback) => {
    expect.options(options, ['resolver']);
    const contracts_directory = options.contracts_directory;
    const build_directory = options.build_mythx_contracts;
    function getFiles(done) {
        if (options.files) {
            done(null, options.files);
        }
        else {
            find_contracts(contracts_directory, done);
        }
    }
    const sourceFilesArtifacts = {};
    const sourceFilesArtifactsUpdatedTimes = {};
    const updatedFiles = [];
    async.series([
        // Get all the source files and create an object out of them.
        function (c) {
            getFiles(function (err, files) {
                if (err) {
                    return c(err);
                }
                // Use an object for O(1) access.
                files.forEach(function (sourceFile) {
                    sourceFilesArtifacts[sourceFile] = [];
                });
                c();
            });
        },
        // Get all the artifact files, and read them, parsing them as JSON
        function (c) {
            fs.readdir(build_directory, function (err, build_files) {
                if (err) {
                    // The build directory may not always exist.
                    if (err.message.indexOf('ENOENT: no such file or directory') >= 0) {
                        // Ignore it.
                        build_files = [];
                    }
                    else {
                        return c(err);
                    }
                }
                build_files = build_files.filter(function (build_file) {
                    return path.extname(build_file) === '.json';
                });
                async.map(build_files, function (buildFile, finished) {
                    fs.readFile(path.join(build_directory, buildFile), 'utf8', function (e, body) {
                        if (e) {
                            return finished(e);
                        }
                        finished(null, body);
                    });
                }, function (e, jsonData) {
                    if (err) {
                        return c(e);
                    }
                    try {
                        for (let i = 0; i < jsonData.length; i++) {
                            const data = JSON.parse(jsonData[i]);
                            // In case there are artifacts from other source locations.
                            if (sourceFilesArtifacts[data.sourcePath] == null) {
                                sourceFilesArtifacts[data.sourcePath] = [];
                            }
                            sourceFilesArtifacts[data.sourcePath].push(data);
                        }
                    }
                    catch (e) {
                        return c(e);
                    }
                    c();
                });
            });
        },
        function (c) {
            // Get the minimum updated time for all of a source file's artifacts
            // (note: one source file might have multiple artifacts).
            Object.keys(sourceFilesArtifacts).forEach(function (sourceFile) {
                const artifacts = sourceFilesArtifacts[sourceFile];
                sourceFilesArtifactsUpdatedTimes[sourceFile] = artifacts.reduce(function (minimum, current) {
                    const updatedAt = new Date(current.updatedAt).getTime();
                    if (updatedAt < minimum) {
                        return updatedAt;
                    }
                    return minimum;
                }, Number.MAX_SAFE_INTEGER);
                // Empty array?
                if (sourceFilesArtifactsUpdatedTimes[sourceFile] ===
                    Number.MAX_SAFE_INTEGER) {
                    sourceFilesArtifactsUpdatedTimes[sourceFile] = 0;
                }
            });
            c();
        },
        // Stat all the source files, getting there updated times, and comparing them to
        // the artifact updated times.
        function (c) {
            const sourceFiles = Object.keys(sourceFilesArtifacts);
            async.map(sourceFiles, function (sourceFile, finished) {
                fs.stat(sourceFile, function (err, stat) {
                    if (err) {
                        // Ignore it. This means the source file was removed
                        // but the artifact file possibly exists. Return null
                        // to signfy that we should ignore it.
                        stat = null;
                    }
                    finished(null, stat);
                });
            }, function (err, sourceFileStats) {
                if (err) {
                    return callback(err);
                }
                sourceFiles.forEach(function (sourceFile, index) {
                    const sourceFileStat = sourceFileStats[index];
                    // Ignore updating artifacts if source file has been removed.
                    if (sourceFileStat == null) {
                        return;
                    }
                    const artifactsUpdatedTime = sourceFilesArtifactsUpdatedTimes[sourceFile] || 0;
                    const sourceFileUpdatedTime = (sourceFileStat.mtime || sourceFileStat.ctime).getTime();
                    if (sourceFileUpdatedTime > artifactsUpdatedTime) {
                        updatedFiles.push(sourceFile);
                    }
                });
                c();
            });
        },
    ], function (err) {
        callback(err, updatedFiles);
    });
};
// Returns the minimal set of sources to pass to solc as compilations targets,
// as well as the complete set of sources so solc can resolve the comp targets' imports.
exports.required_sources = (options, callback) => {
    expect.options(options, ['paths', 'base_path', 'resolver']);
    const resolver = options.resolver;
    // Fetch the whole contract set
    find_contracts(options.contracts_directory, (err, allPaths) => {
        if (err) {
            return callback(err);
        }
        // Solidity test files might have been injected. Include them in the known set.
        options.paths.forEach(_path => {
            if (!allPaths.includes(_path)) {
                allPaths.push(_path);
            }
        });
        const updates = exports.convert_to_absolute_paths(options.paths, options.base_path)
            .sort();
        allPaths = exports.convert_to_absolute_paths(allPaths, options.base_path)
            .sort();
        const allSources = {};
        const compilationTargets = [];
        // Load compiler
        const supplier = new compilerSupplier_1.default(options.compilers.solc);
        supplier
            .load()
            .then(solc => {
            // Get all the source code
            exports.resolveAllSources(resolver, allPaths, solc, (e, resolved) => {
                if (e) {
                    return callback(e);
                }
                // Generate hash of all sources including external packages - passed to solc inputs.
                const resolvedPaths = Object.keys(resolved);
                resolvedPaths.forEach(file => (allSources[file] = resolved[file].body));
                // Exit w/out minimizing if we've been asked to compile everything, or nothing.
                if (exports.listsEqual(options.paths, allPaths)) {
                    return callback(null, allSources, {});
                }
                else if (!options.paths.length) {
                    return callback(null, {}, {});
                }
                // Seed compilationTargets with known updates
                updates.forEach(update => compilationTargets.push(update));
                // While there are updated files in the queue, we take each one
                // and search the entire file corpus to find any sources that import it.
                // Those sources are added to list of compilation targets as well as
                // the update queue because their own ancestors need to be discovered.
                async.whilst(() => updates.length > 0, updateFinished => {
                    const currentUpdate = updates.shift();
                    const files = allPaths.slice();
                    // While files: dequeue and inspect their imports
                    async.whilst(() => files.length > 0, fileFinished => {
                        const currentFile = files.shift();
                        // Ignore targets already selected.
                        if (compilationTargets.includes(currentFile)) {
                            return fileFinished();
                        }
                        let imports;
                        try {
                            imports = exports.getImports(currentFile, resolved[currentFile], solc);
                        }
                        catch (err) {
                            err.message =
                                'Error parsing ' + currentFile + ': ' + err.message;
                            return fileFinished(err);
                        }
                        // If file imports a compilation target, add it
                        // to list of updates and compilation targets
                        if (imports.includes(currentUpdate)) {
                            updates.push(currentFile);
                            compilationTargets.push(currentFile);
                        }
                        fileFinished();
                    }, error => {
                        return updateFinished(error);
                    });
                }, error => {
                    return error
                        ? callback(error)
                        : callback(null, allSources, compilationTargets);
                });
            });
        })
            .catch(callback);
    });
};
// Resolves sources in several async passes. For each resolved set it detects unknown
// imports from external packages and adds them to the set of files to resolve.
exports.resolveAllSources = (resolver, initialPaths, solc, callback) => {
    const mapping = {};
    const allPaths = initialPaths.slice();
    function generateMapping(finished) {
        const promises = [];
        // Dequeue all the known paths, generating resolver promises,
        // We'll add paths if we discover external package imports.
        while (allPaths.length) {
            let file;
            let parent = null;
            const candidate = allPaths.shift();
            // Some paths will have been extracted as imports from a file
            // and have information about their parent location we need to track.
            if (typeof candidate === 'object') {
                file = candidate.file;
                parent = candidate.parent;
            }
            else {
                file = candidate;
            }
            const promise = new Promise((accept, reject) => {
                resolver.resolve(file, parent, (err, body, absolutePath, source) => {
                    err
                        ? reject(err)
                        : accept({ file: absolutePath, body: body, source: source });
                });
            });
            promises.push(promise);
        }
        // Resolve everything known and add it to the map, then inspect each file's
        // imports and add those to the list of paths to resolve if we don't have it.
        Promise.all(promises)
            .then(results => {
            // Generate the sources mapping
            results.forEach(item => (mapping[item.file] = Object.assign({}, item)));
            // Queue unknown imports for the next resolver cycle
            while (results.length) {
                const result = results.shift();
                // Inspect the imports
                let imports;
                try {
                    imports = exports.getImports(result.file, result, solc);
                }
                catch (err) {
                    err.message = 'Error parsing ' + result.file + ': ' + err.message;
                    return finished(err);
                }
                // Detect unknown external packages / add them to the list of files to resolve
                // Keep track of location of this import because we need to report that.
                imports.forEach(item => {
                    if (!mapping[item]) {
                        allPaths.push({ file: item, parent: result.file });
                    }
                });
            }
        })
            .catch(finished)
            .then(finished);
    }
    async.whilst(() => allPaths.length, generateMapping, err => (err ? callback(err) : callback(null, mapping)));
};
exports.getImports = (file, resolved, solc) => {
    const imports = Parser.parseImports(resolved.body, solc);
    // Convert explicitly relative dependencies of modules back into module paths.
    return imports.map(dependencyPath => {
        return exports.isExplicitlyRelative(dependencyPath)
            ? resolved.source.resolve_dependency_path(file, dependencyPath)
            : dependencyPath;
    });
};
exports.listsEqual = (listA, listB) => {
    const a = listA.sort();
    const b = listB.sort();
    return JSON.stringify(a) === JSON.stringify(b);
};
exports.convert_to_absolute_paths = (paths, base) => {
    return paths.map(function (p) {
        // If it's anabsolute paths, leave it alone.
        if (path.isAbsolute(p)) {
            return p;
        }
        // If it's not explicitly relative, then leave it alone (i.e., it's a module).
        if (!exports.isExplicitlyRelative(p)) {
            return p;
        }
        // Path must be explicitly releative, therefore make it absolute.
        return path.resolve(path.join(base, p));
    });
};
exports.isExplicitlyRelative = (import_path) => {
    return import_path.indexOf('.') === 0;
};
//# sourceMappingURL=profiler.js.map