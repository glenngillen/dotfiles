"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyMarkdownLinkReferenceDefinition = exports.createMarkdownReferences = exports.MarkdownResourceProvider = void 0;
const note_1 = require("../model/note");
const utils_1 = require("../utils");
const log_1 = require("../utils/log");
const uri_1 = require("../model/uri");
const datastore_1 = require("../services/datastore");
const markdown_parser_1 = require("./markdown-parser");
class MarkdownResourceProvider {
    constructor(matcher, watcherInit, parser = markdown_parser_1.createMarkdownParser([]), dataStore = new datastore_1.FileDataStore()) {
        this.matcher = matcher;
        this.watcherInit = watcherInit;
        this.parser = parser;
        this.dataStore = dataStore;
        this.disposables = [];
    }
    async init(workspace) {
        var _a, _b;
        const filesByFolder = await Promise.all(this.matcher.include.map(glob => this.dataStore.list(glob, this.matcher.exclude)));
        const files = this.matcher
            .match(filesByFolder.flat())
            .filter(this.supports);
        await Promise.all(files.map(async (uri) => {
            log_1.Logger.info('Found: ' + uri.toString());
            const content = await this.dataStore.read(uri);
            if (utils_1.isSome(content)) {
                workspace.set(this.parser.parse(uri, content));
            }
        }));
        this.disposables = (_b = (_a = this.watcherInit) === null || _a === void 0 ? void 0 : _a.call(this, {
            onDidChange: async (uri) => {
                if (this.matcher.isMatch(uri) && this.supports(uri)) {
                    const content = await this.dataStore.read(uri);
                    utils_1.isSome(content) &&
                        workspace.set(await this.parser.parse(uri, content));
                }
            },
            onDidCreate: async (uri) => {
                if (this.matcher.isMatch(uri) && this.supports(uri)) {
                    const content = await this.dataStore.read(uri);
                    utils_1.isSome(content) &&
                        workspace.set(await this.parser.parse(uri, content));
                }
            },
            onDidDelete: uri => {
                this.supports(uri) && workspace.delete(uri);
            },
        })) !== null && _b !== void 0 ? _b : [];
    }
    supports(uri) {
        return uri.isMarkdown();
    }
    read(uri) {
        return this.dataStore.read(uri);
    }
    async readAsMarkdown(uri) {
        let content = await this.dataStore.read(uri);
        if (utils_1.isSome(content) && uri.fragment) {
            const resource = this.parser.parse(uri, content);
            const section = note_1.Resource.findSection(resource, uri.fragment);
            if (utils_1.isSome(section)) {
                const rows = content.split('\n');
                content = rows
                    .slice(section.range.start.line, section.range.end.line)
                    .join('\n');
            }
        }
        return content;
    }
    async fetch(uri) {
        const content = await this.read(uri);
        return utils_1.isSome(content) ? this.parser.parse(uri, content) : null;
    }
    resolveLink(workspace, resource, link) {
        var _a, _b, _c, _d, _e, _f, _g;
        let targetUri;
        switch (link.type) {
            case 'wikilink': {
                const definitionUri = (_a = resource.definitions.find(def => def.label === link.target)) === null || _a === void 0 ? void 0 : _a.url;
                if (utils_1.isSome(definitionUri)) {
                    const definedUri = resource.uri.resolve(definitionUri);
                    targetUri = (_c = (_b = workspace.find(definedUri, resource.uri)) === null || _b === void 0 ? void 0 : _b.uri) !== null && _c !== void 0 ? _c : uri_1.URI.placeholder(definedUri.path);
                }
                else {
                    const [target, section] = link.target.split('#');
                    targetUri =
                        target === ''
                            ? resource.uri
                            : (_e = (_d = workspace.find(target, resource.uri)) === null || _d === void 0 ? void 0 : _d.uri) !== null && _e !== void 0 ? _e : uri_1.URI.placeholder(link.target);
                    if (section) {
                        targetUri = targetUri.withFragment(section);
                    }
                }
                break;
            }
            case 'link': {
                const [target, section] = link.target.split('#');
                targetUri = (_g = (_f = workspace.find(target, resource.uri)) === null || _f === void 0 ? void 0 : _f.uri) !== null && _g !== void 0 ? _g : uri_1.URI.placeholder(resource.uri.resolve(link.target).path);
                if (section && !targetUri.isPlaceholder()) {
                    targetUri = targetUri.withFragment(section);
                }
                break;
            }
        }
        return targetUri;
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.MarkdownResourceProvider = MarkdownResourceProvider;
function createMarkdownReferences(workspace, noteUri, includeExtension) {
    const source = workspace.find(noteUri);
    // Should never occur since we're already in a file,
    if ((source === null || source === void 0 ? void 0 : source.type) !== 'note') {
        console.warn(`Note ${noteUri.toString()} note found in workspace when attempting \
to generate markdown reference list`);
        return [];
    }
    return source.links
        .filter(link => link.type === 'wikilink')
        .map(link => {
        const targetUri = workspace.resolveLink(source, link);
        const target = workspace.find(targetUri);
        if (utils_1.isNone(target)) {
            log_1.Logger.warn(`Link ${targetUri.toString()} in ${noteUri.toString()} is not valid.`);
            return null;
        }
        if (target.type === 'placeholder') {
            // no need to create definitions for placeholders
            return null;
        }
        let relativeUri = target.uri.relativeTo(noteUri.getDirectory());
        if (!includeExtension) {
            relativeUri = relativeUri.changeExtension('*', '');
        }
        // [wikilink-text]: path/to/file.md "Page title"
        return {
            label: link.rawText.indexOf('[[') > -1
                ? link.rawText.substring(2, link.rawText.length - 2)
                : link.rawText || link.label,
            url: relativeUri.path,
            title: target.title,
        };
    })
        .filter(utils_1.isSome)
        .sort();
}
exports.createMarkdownReferences = createMarkdownReferences;
function stringifyMarkdownLinkReferenceDefinition(definition) {
    const url = definition.url.indexOf(' ') > 0 ? `<${definition.url}>` : definition.url;
    let text = `[${definition.label}]: ${url}`;
    if (definition.title) {
        text = `${text} "${definition.title}"`;
    }
    return text;
}
exports.stringifyMarkdownLinkReferenceDefinition = stringifyMarkdownLinkReferenceDefinition;
//# sourceMappingURL=markdown-provider.js.map