"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleInstanceTimeout = exports.sleep = exports.httpsRequest = exports.exec = void 0;
const cp = require("child_process");
const https = require("https");
function exec(cmd) {
    return new Promise((resolve, reject) => {
        cp.exec(cmd, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            return resolve({ stdout, stderr });
        });
    });
}
exports.exec = exec;
function httpsRequest(url, options = {}, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
        https.request(url, options, res => {
            if (res.statusCode === 301 || res.statusCode === 302) { // follow redirects
                return resolve(httpsRequest(res.headers.location, options, encoding));
            }
            if (res.statusCode !== 200) {
                return reject(res.statusMessage);
            }
            let body = '';
            res.setEncoding(encoding)
                .on('data', data => body += data)
                .on('end', () => resolve(body));
        })
            .on('error', reject)
            .end();
    });
}
exports.httpsRequest = httpsRequest;
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
exports.sleep = sleep;
// A small wrapper around setTimeout which ensures that only a single timeout
// timer can be running at a time. Attempts to add a new timeout silently fail.
class SingleInstanceTimeout {
    constructor() {
        this.timerLock = false;
    }
    timeout(fn, delay, ...args) {
        if (!this.timerLock) {
            this.timerLock = true;
            this.timerId = setTimeout(function () { this.timerLock = false; fn(); }, delay, args);
        }
    }
    clear() {
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        this.timerLock = false;
    }
}
exports.SingleInstanceTimeout = SingleInstanceTimeout;
//# sourceMappingURL=utils.js.map