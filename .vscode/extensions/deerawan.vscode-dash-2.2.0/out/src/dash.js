"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Dash = /** @class */ (function () {
    function Dash(OS, option) {
        this.OS = OS;
        this.URIHandler =
            {
                darwin: 'open -g',
                linux: 'zeal',
                // Same technique as Silverlake Software's "Search Docsets" extension,
                // which is written by Velocity's developer and is tested to work with current Velocity on W10.
                win32: 'cmd.exe /c start "" ',
            }[this.OS] || 'zeal';
        this.option = option;
    }
    /**
     * Get command to open dash
     *
     * @param {string} query - text to find
     * @param {string} docsets - array of docset e.g. [css, less]
     * @return {string} dash handler and uri
     */
    Dash.prototype.getCommand = function (query, docsets) {
        var _this = this;
        if (docsets === void 0) { docsets = []; }
        var keys = (docsets || [])
            .map(function (docset) { return "" + (_this.option.exactDocset ? 'exact:' : '') + docset; })
            .join(',');
        var encodedQuery = encodeURIComponent(query);
        return this.URIHandler + " \"dash-plugin://query=" + encodedQuery + (keys
            ? "&keys=" + keys
            : "") + "\"";
    };
    return Dash;
}());
exports.Dash = Dash;
//# sourceMappingURL=dash.js.map