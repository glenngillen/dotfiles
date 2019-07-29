"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const process = require("process");
let hcl = require('../../hcl-hil.js');
if (process.argv.length < 2) {
    console.log("ERROR: Missing argument.");
}
else {
    let path = process.argv[2];
    let text = fs.readFileSync(path).toString();
    let [ast, error] = hcl.parseHcl(text);
    if (error) {
        console.log("ERROR:", error);
    }
    else {
        process.stdout.write(JSON.stringify(ast, null, 2));
    }
}

//# sourceMappingURL=dump-hcl.js.map
