"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const helpers_1 = require("./helpers");
const template_1 = require("./template");
const Viz = require('viz.js');
function createGraphWebView(dot, type, group, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        let template = yield helpers_1.read(ctx.asAbsolutePath('out/src/ui/graph.html'));
        let svgDoc = Viz(dot);
        let start = svgDoc.indexOf('<svg');
        let end = svgDoc.indexOf('</svg>', start);
        let element = svgDoc.substr(start, end - start + 6);
        let rendered = yield template_1.loadTemplate(ctx.asAbsolutePath('out/src/ui/graph.html'), {
            type: type,
            element: element,
            groupUri: group.uri.toString()
        });
        let panel = vscode.window.createWebviewPanel('terraform.preview-graph', `Terraform: Graph (${type})`, vscode.ViewColumn.Active);
        panel.webview.html = rendered;
        return panel;
    });
}
exports.createGraphWebView = createGraphWebView;

//# sourceMappingURL=graph.js.map
