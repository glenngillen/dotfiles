"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OSOptions = {
    darwin: 'open -g',
    linux: 'zeal',
    // Same technique as Silverlake Software's "Search Docsets" extension,
    // which is written by Velocity's developer and is tested to work with current Velocity on W10.
    win32: 'cmd.exe /c start "" ',
};
class Dash {
    constructor(OS, option) {
        this.OS = OS;
        this.URIHandler = OSOptions[this.OS] || 'zeal';
        this.option = option;
    }
    /**
     * Get command to open dash
     *
     * @param {string} query - text to find
     * @param {string} docsets - array of docset e.g. [css, less]
     * @return {string} dash handler and uri
     */
    getCommand(query, docsets = []) {
        const keys = (docsets || [])
            .map(docset => `${this.option.exactDocset ? 'exact:' : ''}${docset}`)
            .join(',');
        const encodedQuery = encodeURIComponent(query);
        return `${this.URIHandler} "dash-plugin://query=${encodedQuery}${keys ? `&keys=${keys}` : ``}"`;
    }
}
exports.Dash = Dash;
