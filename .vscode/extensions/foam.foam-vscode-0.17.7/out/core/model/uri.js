"use strict";
// `URI` is mostly compatible with VSCode's `Uri`.
// Having a Foam-specific URI object allows for easier maintenance of the API.
// See https://github.com/foambubble/foam/pull/537 for more context.
// Some code in this file comes from https://github.com/microsoft/vscode/main/src/vs/base/common/uri.ts
// See LICENSE for details
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.URI = void 0;
const pathUtils = __importStar(require("../utils/path"));
/**
 * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 * ```txt
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 * ```
 */
const _empty = '';
const _slash = '/';
const _regexp = /^(([^:/?#]{2,}?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
class URI {
    constructor(from = {}) {
        var _a, _b, _c, _d, _e;
        this.scheme = (_a = from.scheme) !== null && _a !== void 0 ? _a : _empty;
        this.authority = (_b = from.authority) !== null && _b !== void 0 ? _b : _empty;
        this.path = (_c = from.path) !== null && _c !== void 0 ? _c : _empty; // We assume the path is already posix
        this.query = (_d = from.query) !== null && _d !== void 0 ? _d : _empty;
        this.fragment = (_e = from.fragment) !== null && _e !== void 0 ? _e : _empty;
    }
    static parse(value) {
        var _a, _b, _c, _d;
        const match = _regexp.exec(value);
        if (!match) {
            return new URI();
        }
        return new URI({
            scheme: match[2] || 'file',
            authority: percentDecode((_a = match[4]) !== null && _a !== void 0 ? _a : _empty),
            path: pathUtils.fromFsPath(percentDecode((_b = match[5]) !== null && _b !== void 0 ? _b : _empty))[0],
            query: percentDecode((_c = match[7]) !== null && _c !== void 0 ? _c : _empty),
            fragment: percentDecode((_d = match[9]) !== null && _d !== void 0 ? _d : _empty),
        });
    }
    static file(value) {
        const [path, authority] = pathUtils.fromFsPath(value);
        return new URI({ scheme: 'file', authority, path });
    }
    static placeholder(path) {
        return new URI({ scheme: 'placeholder', path: path });
    }
    resolve(value, isDirectory = false) {
        const uri = value instanceof URI ? value : URI.parse(value);
        if (!uri.isAbsolute()) {
            if (uri.scheme === 'file' || uri.scheme === 'placeholder') {
                let newUri = this.withFragment(uri.fragment);
                if (uri.path) {
                    newUri = (isDirectory ? newUri : newUri.getDirectory())
                        .joinPath(uri.path)
                        .changeExtension('', this.getExtension());
                }
                return newUri;
            }
        }
        return uri;
    }
    isAbsolute() {
        return pathUtils.isAbsolute(this.path);
    }
    getDirectory() {
        const path = pathUtils.getDirectory(this.path);
        return new URI({ ...this, path });
    }
    getBasename() {
        return pathUtils.getBasename(this.path);
    }
    getName() {
        return pathUtils.getName(this.path);
    }
    getExtension() {
        return pathUtils.getExtension(this.path);
    }
    changeExtension(from, to) {
        const path = pathUtils.changeExtension(this.path, from, to);
        return new URI({ ...this, path });
    }
    joinPath(...paths) {
        const path = pathUtils.joinPath(this.path, ...paths);
        return new URI({ ...this, path });
    }
    relativeTo(uri) {
        const path = pathUtils.relativeTo(this.path, uri.path);
        return new URI({ ...this, path });
    }
    withFragment(fragment) {
        return new URI({ ...this, fragment });
    }
    /**
     * Returns a URI without the fragment and query information
     */
    asPlain() {
        return new URI({ ...this, fragment: '', query: '' });
    }
    isPlaceholder() {
        return this.scheme === 'placeholder';
    }
    toFsPath() {
        return pathUtils.toFsPath(this.path, this.scheme === 'file' ? this.authority : '');
    }
    toString() {
        return encode(this, false);
    }
    isMarkdown() {
        const ext = this.getExtension();
        return ext === '.md' || ext === '.markdown';
    }
    isEqual(uri) {
        return (this.authority === uri.authority &&
            this.scheme === uri.scheme &&
            this.path === uri.path &&
            this.fragment === uri.fragment &&
            this.query === uri.query);
    }
}
exports.URI = URI;
// --- encode / decode
function decodeURIComponentGraceful(str) {
    try {
        return decodeURIComponent(str);
    }
    catch {
        if (str.length > 3) {
            return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
        }
        else {
            return str;
        }
    }
}
const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
function percentDecode(str) {
    if (!str.match(_rEncodedAsHex)) {
        return str;
    }
    return str.replace(_rEncodedAsHex, match => decodeURIComponentGraceful(match));
}
/**
 * Create the external version of a uri
 */
function encode(uri, skipEncoding) {
    const encoder = !skipEncoding
        ? encodeURIComponentFast
        : encodeURIComponentMinimal;
    let res = '';
    // eslint-disable-next-line prefer-const
    let { scheme, authority, path, query, fragment } = uri;
    if (scheme) {
        res += scheme;
        res += ':';
    }
    if (authority || scheme === 'file') {
        res += _slash;
        res += _slash;
    }
    if (authority) {
        let idx = authority.indexOf('@');
        if (idx !== -1) {
            // <user>@<auth>
            const userinfo = authority.substr(0, idx);
            authority = authority.substr(idx + 1);
            idx = userinfo.indexOf(':');
            if (idx === -1) {
                res += encoder(userinfo, false);
            }
            else {
                // <user>:<pass>@<auth>
                res += encoder(userinfo.substr(0, idx), false);
                res += ':';
                res += encoder(userinfo.substr(idx + 1), false);
            }
            res += '@';
        }
        authority = authority.toLowerCase();
        idx = authority.indexOf(':');
        if (idx === -1) {
            res += encoder(authority, false);
        }
        else {
            // <auth>:<port>
            res += encoder(authority.substr(0, idx), false);
            res += authority.substr(idx);
        }
    }
    if (path) {
        // upper-case windows drive letters in /c:/fff or c:/fff
        if (path.length >= 3 &&
            path.charCodeAt(0) === 47 /* Slash */ &&
            path.charCodeAt(2) === 58 /* Colon */) {
            const code = path.charCodeAt(1);
            if (code >= 97 /* a */ && code <= 122 /* z */) {
                path = `/${String.fromCharCode(code - 32)}:${path.substr(3)}`; // "/C:".length === 3
            }
        }
        else if (path.length >= 2 && path.charCodeAt(1) === 58 /* Colon */) {
            const code = path.charCodeAt(0);
            if (code >= 97 /* a */ && code <= 122 /* z */) {
                path = `${String.fromCharCode(code - 32)}:${path.substr(2)}`; // "/C:".length === 3
            }
        }
        // encode the rest of the path
        res += encoder(path, true);
    }
    if (query) {
        res += '?';
        res += encoder(query, false);
    }
    if (fragment) {
        res += '#';
        res += !skipEncoding ? encodeURIComponentFast(fragment, false) : fragment;
    }
    return res;
}
// reserved characters: https://tools.ietf.org/html/rfc3986#section-2.2
const encodeTable = {
    [58 /* Colon */]: '%3A',
    [47 /* Slash */]: '%2F',
    [63 /* QuestionMark */]: '%3F',
    [35 /* Hash */]: '%23',
    [91 /* OpenSquareBracket */]: '%5B',
    [93 /* CloseSquareBracket */]: '%5D',
    [64 /* AtSign */]: '%40',
    [33 /* ExclamationMark */]: '%21',
    [36 /* DollarSign */]: '%24',
    [38 /* Ampersand */]: '%26',
    [39 /* SingleQuote */]: '%27',
    [40 /* OpenParen */]: '%28',
    [41 /* CloseParen */]: '%29',
    [42 /* Asterisk */]: '%2A',
    [43 /* Plus */]: '%2B',
    [44 /* Comma */]: '%2C',
    [59 /* Semicolon */]: '%3B',
    [61 /* Equals */]: '%3D',
    [32 /* Space */]: '%20',
};
function encodeURIComponentFast(uriComponent, allowSlash) {
    let res = undefined;
    let nativeEncodePos = -1;
    for (let pos = 0; pos < uriComponent.length; pos++) {
        const code = uriComponent.charCodeAt(pos);
        // unreserved characters: https://tools.ietf.org/html/rfc3986#section-2.3
        if ((code >= 97 /* a */ && code <= 122 /* z */) ||
            (code >= 65 /* A */ && code <= 90 /* Z */) ||
            (code >= 48 /* Digit0 */ && code <= 57 /* Digit9 */) ||
            code === 45 /* Dash */ ||
            code === 46 /* Period */ ||
            code === 95 /* Underline */ ||
            code === 126 /* Tilde */ ||
            (allowSlash && code === 47 /* Slash */)) {
            // check if we are delaying native encode
            if (nativeEncodePos !== -1) {
                res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                nativeEncodePos = -1;
            }
            // check if we write into a new string (by default we try to return the param)
            if (res !== undefined) {
                res += uriComponent.charAt(pos);
            }
        }
        else {
            // encoding needed, we need to allocate a new string
            if (res === undefined) {
                res = uriComponent.substr(0, pos);
            }
            // check with default table first
            const escaped = encodeTable[code];
            if (escaped !== undefined) {
                // check if we are delaying native encode
                if (nativeEncodePos !== -1) {
                    res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                    nativeEncodePos = -1;
                }
                // append escaped variant to result
                res += escaped;
            }
            else if (nativeEncodePos === -1) {
                // use native encode only when needed
                nativeEncodePos = pos;
            }
        }
    }
    if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
    }
    return res !== undefined ? res : uriComponent;
}
function encodeURIComponentMinimal(path) {
    let res = undefined;
    for (let pos = 0; pos < path.length; pos++) {
        const code = path.charCodeAt(pos);
        if (code === 35 /* Hash */ || code === 63 /* QuestionMark */) {
            if (res === undefined) {
                res = path.substr(0, pos);
            }
            res += encodeTable[code];
        }
        else {
            if (res !== undefined) {
                res += path[pos];
            }
        }
    }
    return res !== undefined ? res : path;
}
//# sourceMappingURL=uri.js.map