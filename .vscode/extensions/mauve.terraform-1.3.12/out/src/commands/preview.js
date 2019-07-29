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
const graph_1 = require("../graph");
const group_quickpick_1 = require("../group-quickpick");
const command_1 = require("./command");
const Dot = require('graphlib-dot');
class PreviewGraphCommand extends command_1.Command {
    constructor(index, runner, ctx) {
        super("preview-graph", ctx, command_1.CommandType.PALETTE);
        this.index = index;
        this.runner = runner;
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const types = ['plan', 'plan-destroy', 'apply',
                'validate', 'input', 'refresh'];
            let type = yield vscode.window.showQuickPick(types, { placeHolder: "Choose graph type" });
            let group = yield group_quickpick_1.groupQuickPick(this.index.index);
            if (!group)
                return;
            try {
                let dot = yield this.runner.run({
                    cwd: group.uri.fsPath,
                    reportMetric: true
                }, "graph", "-draw-cycles", `-type=${type}`, ".");
                let processedDot = this.replaceNodesWithLinks(group, dot);
                // make background transparent
                processedDot = processedDot.replace('digraph {\n', 'digraph {\n  bgcolor="transparent";\n');
                yield graph_1.createGraphWebView(processedDot, type, group, this.ctx);
            }
            catch (error) {
                this.logger.error('Generating graph preview failed:');
                let lines = error.message.split(/[\r?\n]+/);
                for (let line of lines)
                    this.logger.error('\t' + line);
                yield vscode.window.showErrorMessage(`Error generating graph, see output view.`);
            }
        });
    }
    replaceNodesWithLinks(group, dot) {
        const regex = /(\[[a-z0-9 ]+\] )?([^ ]+)/;
        let graph = Dot.read(dot);
        let changedNodes = new Map();
        for (let node of graph.nodes()) {
            let targetId = node.match(regex)[2];
            let section = group.section(targetId);
            if (section) {
                changedNodes.set(node, section);
            }
        }
        for (let [node, section] of changedNodes) {
            graph.setNode(node, { href: `terraform-section:${section.id()}` });
        }
        return Dot.write(graph);
    }
}
exports.PreviewGraphCommand = PreviewGraphCommand;

//# sourceMappingURL=preview.js.map
