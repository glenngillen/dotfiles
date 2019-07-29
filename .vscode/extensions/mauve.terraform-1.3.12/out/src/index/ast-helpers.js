"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
function valueToMarkdown(value, depth = 0) {
    switch (ast_1.getValueType(value)) {
        case ast_1.AstValueType.Map:
            return mapToMarkdown(value, depth);
        case ast_1.AstValueType.List:
            return listToMarkdown(value, depth);
        case ast_1.AstValueType.String:
            return stringToMarkdown(value);
    }
}
exports.valueToMarkdown = valueToMarkdown;
function mapToMarkdown(value, depth) {
    const list = value.List;
    if (list.Items.length === 0) {
        return '*empty map*';
    }
    const lines = list.Items.map((item, index) => {
        const label = ast_1.getText(item.Keys[0].Token, { stripQuotes: true });
        const prefix = "  ".repeat(depth) + `- ${label}:`;
        if (ast_1.getValueType(item.Val) !== ast_1.AstValueType.String) {
            return prefix + "\n" + valueToMarkdown(item.Val, depth + 1);
        }
        else {
            return prefix + " " + stringToMarkdown(item.Val);
        }
    });
    return lines.join("\n");
}
function listToMarkdown(value, depth) {
    const list = value.List;
    if (list.length === 0) {
        return '*empty list*';
    }
    const lines = list.map((item, index) => {
        const v = ast_1.getText(item.Token, { stripQuotes: true, fallback: '<failed to extract value>' });
        return "  ".repeat(depth) + `${index + 1}. \`${v}\``;
    });
    return lines.join("\n");
}
function stringToMarkdown(value) {
    let str = ast_1.getStringValue(value, "<failed to extract value>", { stripQuotes: true });
    return "`" + str + "`";
}

//# sourceMappingURL=ast-helpers.js.map
