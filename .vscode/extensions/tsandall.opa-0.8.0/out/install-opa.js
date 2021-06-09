'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const https = require("https");
const os = require("os");
const url_1 = require("url");
const vscode = require("vscode");
const extension_1 = require("./extension");
const releaseDownloader = require('@fohlen/github-release-downloader');
let installDeclined = false;
function promptForInstall() {
    if (installDeclined) {
        return;
    }
    vscode.window.showInformationMessage('OPA executable is missing from your $PATH or \'opa.path\' is not set to the correct path. Would you like to install OPA?', 'Install')
        .then((selection) => {
        if (selection === 'Install') {
            install();
        }
        else {
            installDeclined = true;
        }
    });
}
exports.promptForInstall = promptForInstall;
function install() {
    return __awaiter(this, void 0, void 0, function* () {
        extension_1.opaOutputChannel.clear();
        extension_1.opaOutputChannel.show(true);
        extension_1.opaOutputChannel.appendLine('Getting latest OPA release for your platform...');
        let url;
        try {
            url = yield getOpaDownloadUrl();
            extension_1.opaOutputChannel.appendLine(`Found latest OPA release: ${url}`);
            if (url === null || url === undefined || url.toString().trim() === '') {
                extension_1.opaOutputChannel.appendLine('Could not find the latest OPA release for your platform');
                return;
            }
        }
        catch (e) {
            extension_1.opaOutputChannel.appendLine('Something went wrong while getting the latest OPA release:');
            extension_1.opaOutputChannel.appendLine(e);
            return;
        }
        extension_1.opaOutputChannel.appendLine('Downloading OPA executable...');
        let path;
        try {
            path = yield downloadFile(url);
            extension_1.opaOutputChannel.appendLine(`OPA executable downloaded to ${path}`);
        }
        catch (e) {
            extension_1.opaOutputChannel.appendLine('Something went wrong while downloading the OPA executable:');
            extension_1.opaOutputChannel.appendLine(e);
            return;
        }
        extension_1.opaOutputChannel.appendLine('Changing file mode to 0755 to allow execution...');
        try {
            yield vscode.workspace.getConfiguration('opa').update('path', path, true);
            fs.chmodSync(path, 0o755);
        }
        catch (e) {
            extension_1.opaOutputChannel.appendLine(e);
            return;
        }
        extension_1.opaOutputChannel.appendLine(`Setting 'opa.path' to '${path}'...`);
        try {
            yield vscode.workspace.getConfiguration('opa').update('path', path, true);
        }
        catch (e) {
            extension_1.opaOutputChannel.appendLine('Something went wrong while saving the \'opa.path\' setting:');
            extension_1.opaOutputChannel.appendLine(e);
            return;
        }
        extension_1.opaOutputChannel.appendLine('Done!');
    });
}
// Downloads a file given a URL
// Returns a Promise that resolves to the absolute file path when the download is complete
function downloadFile(url) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use the user's home directory as the default base directory
        const dest = os.homedir();
        return releaseDownloader.downloadAsset(url.href, getOPAExecutableName(), dest, () => {
            // Lame progress bar
            extension_1.opaOutputChannel.append('.');
        });
    });
}
function getOpaDownloadUrl() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // TODO: Honor HTTP proxy settings from `vscode.workspace.getConfiguration('http').get('proxy')`
            https.get({
                hostname: 'api.github.com',
                path: '/repos/open-policy-agent/opa/releases/latest',
                headers: {
                    'User-Agent': 'node.js',
                    'Authorization': `token ${getToken()}`
                }
            }, (res) => {
                let rawData = '';
                res.on('data', (d) => {
                    rawData += d;
                });
                res.on('end', () => {
                    try {
                        const release = JSON.parse(rawData);
                        const url = getUrlFromRelease(release);
                        resolve(new url_1.URL(url));
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }).on('error', (e) => reject(e));
        });
    });
}
function getUrlFromRelease(release) {
    // release.assets.name contains {'darwin', 'linux', 'windows'}
    const assets = release.assets || [];
    const os = process.platform;
    let targetAsset;
    switch (os) {
        case 'darwin':
            targetAsset = assets.filter((asset) => asset.name.indexOf('darwin') !== -1)[0];
            break;
        case 'linux':
            targetAsset = assets.filter((asset) => asset.name.indexOf('linux') !== -1)[0];
            break;
        case 'win32':
            targetAsset = assets.filter((asset) => asset.name.indexOf('windows') !== -1)[0];
            break;
        default:
            targetAsset = { browser_download_url: '' };
    }
    return targetAsset.browser_download_url;
}
function getOPAExecutableName() {
    const os = process.platform;
    switch (os) {
        case 'darwin':
        case 'linux':
            return 'opa';
        case 'win32':
            return 'opa.exe';
        default:
            return 'opa';
    }
}
function getToken() {
    // Need an OAuth token to access Github because
    // this gets around the ridiculously low
    // anonymous access rate limits (60 requests/sec/IP)
    // This token only gives access to "public_repo" and "repo:status" scopes
    return ["0", "0", "b", "6", "2", "d", "1",
        "0", "4", "d", "8", "5", "4", "9",
        "4", "b", "d", "6", "e", "e", "9",
        "5", "f", "1", "7", "1", "b", "d",
        "0", "2", "3", "c", "e", "4", "a",
        "3", "9", "a", "0", "6"].join('');
}
//# sourceMappingURL=install-opa.js.map