"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const prebuildInstall = __importStar(require("prebuild-install"));
var NodeRuntime;
(function (NodeRuntime) {
    NodeRuntime[NodeRuntime["Electron"] = 1] = "Electron";
    NodeRuntime[NodeRuntime["Node"] = 2] = "Node";
})(NodeRuntime = exports.NodeRuntime || (exports.NodeRuntime = {}));
function packageToGithubRepo(name) {
    let repo;
    switch (name) {
        case 'tree-sitter':
            repo = 'node-tree-sitter';
            break;
        default:
            repo = name;
    }
    return repo;
}
function downloadUrl(name, version, nodeRuntime) {
    const repo = packageToGithubRepo(name);
    const urlBase = `https://github.com/tree-sitter/${repo}/releases/download/v${version}/`;
    const prebuild = `${name}-v${version}-${nodeRuntime === NodeRuntime.Electron ? 'electron' : 'node'}-v${process.versions.modules}-${process.platform}-${process.arch}.tar.gz`;
    return `${urlBase}${prebuild}`;
}
function fetchPrebuild(name, nodeRuntime) {
    const pkgRoot = path.resolve(path.join(__dirname, '../../node_modules', name));
    const pkg = require(`${pkgRoot}/package.json`);
    const url = downloadUrl(pkg.name, pkg.version, nodeRuntime);
    return new Promise((res, rej) => {
        prebuildInstall.download(url, { pkg, path: pkgRoot }, (err) => {
            err ? rej(err) : res();
        });
    });
}
function rebuildTreeSitter(nodeRuntime) {
    return Promise.all([fetchPrebuild('tree-sitter', nodeRuntime), fetchPrebuild('tree-sitter-ruby', nodeRuntime)]);
}
exports.rebuildTreeSitter = rebuildTreeSitter;
//# sourceMappingURL=rebuilder.js.map