"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownItWithFoamTags = exports.markdownItWithFoamLinks = void 0;
const markdown_it_regex_1 = __importDefault(require("markdown-it-regex"));
const foam_core_1 = require("foam-core");
const feature = {
    activate: async (_context, foamPromise) => {
        const foam = await foamPromise;
        return {
            extendMarkdownIt: (md) => [exports.markdownItWithFoamTags, exports.markdownItWithFoamLinks].reduce((acc, extension) => extension(acc, foam.workspace), md),
        };
    },
};
exports.markdownItWithFoamLinks = (md, workspace) => {
    return md.use(markdown_it_regex_1.default, {
        name: 'connect-wikilinks',
        regex: /\[\[([^[\]]+?)\]\]/,
        replace: (wikilink) => {
            try {
                const resource = workspace.find(wikilink);
                if (resource == null) {
                    return getPlaceholderLink(wikilink);
                }
                return `<a class='foam-note-link' title='${resource.title}' href='${foam_core_1.URI.toFsPath(resource.uri)}'>${wikilink}</a>`;
            }
            catch (e) {
                foam_core_1.Logger.error(`Error while creating link for [[${wikilink}]] in Preview panel`, e);
                return getPlaceholderLink(wikilink);
            }
        },
    });
};
const getPlaceholderLink = (content) => `<a class='foam-placeholder-link' title="Link to non-existing resource" href="javascript:void(0);">${content}</a>`;
exports.markdownItWithFoamTags = (md, workspace) => {
    return md.use(markdown_it_regex_1.default, {
        name: 'foam-tags',
        regex: /(#\w+)/,
        replace: (tag) => {
            try {
                const resource = workspace.find(tag);
                if (resource == null) {
                    return getFoamTag(tag);
                }
            }
            catch (e) {
                foam_core_1.Logger.error(`Error while creating link for ${tag} in Preview panel`, e);
                return getFoamTag(tag);
            }
        },
    });
};
const getFoamTag = (content) => `<span class='foam-tag'>${content}</span>`;
exports.default = feature;
//# sourceMappingURL=preview-navigation.js.map