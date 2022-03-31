"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoamWorkspace = void 0;
const uri_1 = require("./uri");
const path_1 = require("../utils/path");
const utils_1 = require("../utils");
const event_1 = require("../common/event");
class FoamWorkspace {
    constructor() {
        this.onDidAddEmitter = new event_1.Emitter();
        this.onDidUpdateEmitter = new event_1.Emitter();
        this.onDidDeleteEmitter = new event_1.Emitter();
        this.onDidAdd = this.onDidAddEmitter.event;
        this.onDidUpdate = this.onDidUpdateEmitter.event;
        this.onDidDelete = this.onDidDeleteEmitter.event;
        this.providers = [];
        /**
         * Resources by path
         */
        this.resources = new Map();
    }
    registerProvider(provider) {
        this.providers.push(provider);
        return provider.init(this);
    }
    set(resource) {
        const old = this.find(resource.uri);
        this.resources.set(normalize(resource.uri.path), resource);
        utils_1.isSome(old)
            ? this.onDidUpdateEmitter.fire({ old: old, new: resource })
            : this.onDidAddEmitter.fire(resource);
        return this;
    }
    delete(uri) {
        const deleted = this.resources.get(normalize(uri.path));
        this.resources.delete(normalize(uri.path));
        utils_1.isSome(deleted) && this.onDidDeleteEmitter.fire(deleted);
        return deleted !== null && deleted !== void 0 ? deleted : null;
    }
    exists(uri) {
        return utils_1.isSome(this.find(uri));
    }
    list() {
        return Array.from(this.resources.values());
    }
    get(uri) {
        const note = this.find(uri);
        if (utils_1.isSome(note)) {
            return note;
        }
        else {
            throw new Error('Resource not found: ' + uri.path);
        }
    }
    listByIdentifier(identifier) {
        const needle = normalize('/' + identifier);
        const mdNeedle = path_1.getExtension(needle) !== '.md' ? needle + '.md' : undefined;
        const resources = [];
        for (const key of this.resources.keys()) {
            if ((mdNeedle && key.endsWith(mdNeedle)) || key.endsWith(needle)) {
                resources.push(this.resources.get(normalize(key)));
            }
        }
        return resources.sort((a, b) => a.uri.path.localeCompare(b.uri.path));
    }
    /**
     * Returns the minimal identifier for the given resource
     *
     * @param forResource the resource to compute the identifier for
     */
    getIdentifier(forResource) {
        const amongst = [];
        const basename = forResource.getBasename();
        for (const res of this.resources.values()) {
            // Just a quick optimization to only add the elements that might match
            if (res.uri.path.endsWith(basename)) {
                if (!res.uri.isEqual(forResource)) {
                    amongst.push(res.uri);
                }
            }
        }
        let identifier = FoamWorkspace.getShortestIdentifier(forResource.path, amongst.map(uri => uri.path));
        identifier = path_1.changeExtension(identifier, '.md', '');
        if (forResource.fragment) {
            identifier += `#${forResource.fragment}`;
        }
        return identifier;
    }
    find(reference, baseUri) {
        var _a;
        if (reference instanceof uri_1.URI) {
            return (_a = this.resources.get(normalize(reference.path))) !== null && _a !== void 0 ? _a : null;
        }
        let resource = null;
        const [path, fragment] = reference.split('#');
        if (FoamWorkspace.isIdentifier(path)) {
            resource = this.listByIdentifier(path)[0];
        }
        else {
            if (path_1.isAbsolute(path) || utils_1.isSome(baseUri)) {
                if (path_1.getExtension(path) !== '.md') {
                    const uri = baseUri.resolve(path + '.md');
                    resource = uri ? this.resources.get(normalize(uri.path)) : null;
                }
                if (!resource) {
                    const uri = baseUri.resolve(path);
                    resource = uri ? this.resources.get(normalize(uri.path)) : null;
                }
            }
        }
        if (resource && fragment) {
            resource = { ...resource, uri: resource.uri.withFragment(fragment) };
        }
        return resource !== null && resource !== void 0 ? resource : null;
    }
    resolveLink(resource, link) {
        var _a;
        // TODO add tests
        const provider = this.providers.find(p => p.supports(resource.uri));
        return ((_a = provider === null || provider === void 0 ? void 0 : provider.resolveLink(this, resource, link)) !== null && _a !== void 0 ? _a : uri_1.URI.placeholder(link.target));
    }
    read(uri) {
        var _a;
        const provider = this.providers.find(p => p.supports(uri));
        return (_a = provider === null || provider === void 0 ? void 0 : provider.read(uri)) !== null && _a !== void 0 ? _a : Promise.resolve(null);
    }
    readAsMarkdown(uri) {
        var _a;
        const provider = this.providers.find(p => p.supports(uri));
        return (_a = provider === null || provider === void 0 ? void 0 : provider.readAsMarkdown(uri)) !== null && _a !== void 0 ? _a : Promise.resolve(null);
    }
    dispose() {
        this.onDidAddEmitter.dispose();
        this.onDidDeleteEmitter.dispose();
        this.onDidUpdateEmitter.dispose();
    }
    static isIdentifier(path) {
        return !(path.startsWith('/') ||
            path.startsWith('./') ||
            path.startsWith('../'));
    }
    /**
     * Returns the minimal identifier for the given string amongst others
     *
     * @param forPath the value to compute the identifier for
     * @param amongst the set of strings within which to find the identifier
     */
    static getShortestIdentifier(forPath, amongst) {
        const needleTokens = forPath.split('/').reverse();
        const haystack = amongst
            .filter(value => value !== forPath)
            .map(value => value.split('/').reverse());
        let tokenIndex = 0;
        let res = needleTokens;
        while (tokenIndex < needleTokens.length) {
            for (let j = haystack.length - 1; j >= 0; j--) {
                if (haystack[j].length < tokenIndex ||
                    needleTokens[tokenIndex] !== haystack[j][tokenIndex]) {
                    haystack.splice(j, 1);
                }
            }
            if (haystack.length === 0) {
                res = needleTokens.splice(0, tokenIndex + 1);
                break;
            }
            tokenIndex++;
        }
        const identifier = res
            .filter(token => token.trim() !== '')
            .reverse()
            .join('/');
        return identifier;
    }
}
exports.FoamWorkspace = FoamWorkspace;
const normalize = (v) => v.toLocaleLowerCase();
//# sourceMappingURL=workspace.js.map