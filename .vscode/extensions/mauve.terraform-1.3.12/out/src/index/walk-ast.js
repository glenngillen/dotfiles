"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const process = require("process");
const ast_1 = require("./ast");
let hcl = require('../hcl-hil.js');
if (process.argv.length < 2) {
    console.log("ERROR: Missing argument.");
}
else {
    let text = "";
    if (process.argv.length === 2) {
        let path = process.argv[2];
        text = fs.readFileSync(path).toString();
    }
    else {
        text = process.argv[3];
    }
    let [ast, error] = hcl.parseHcl(text);
    if (error) {
        console.log("ERROR:", error);
    }
    else {
        ast_1.walk(ast, (t, n, p) => {
            process.stdout.write(p.map(() => "   ").join(""));
            if (n.Keys && n.Keys.length === 1 && p.length > 3 && p[p.length - 3].node.Keys[0].Token.Text === "locals") {
                process.stdout.write(" * ");
            }
            process.stdout.write(`node: ${t}`);
            if (n.Keys)
                process.stdout.write(` Keys=[${n.Keys.map((k) => k.Token.Text).join(", ")}]`);
            process.stdout.write(' ' + ["Items", "Assign", "Val"].filter((k) => n[k]).join(" "));
            if (n.Token)
                process.stdout.write(` Token=${n.Token.Text} TokenType=${n.Token.Type}`);
            process.stdout.write("\n");
        });
    }
}

//# sourceMappingURL=walk-ast.js.map
