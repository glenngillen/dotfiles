"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
var NodeType;
(function (NodeType) {
    NodeType["Unknown"] = "UNKNOWN";
    NodeType["Node"] = "NODE";
    NodeType["Item"] = "ITEM";
    NodeType["Key"] = "KEY";
    NodeType["Value"] = "VALUE";
    NodeType["List"] = "LIST";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
function walkInternal(node, visitor, type, path, index, array) {
    visitor(type, node, path, index, array);
    const current = [{ type: type, node: node }];
    if (node.hasOwnProperty("Node")) {
        walkInternal(node.Node, visitor, NodeType.Node, path.concat(current));
    }
    else if (node.hasOwnProperty("Items")) {
        node.Items.forEach((item, idx, items) => {
            walkInternal(item, visitor, NodeType.Item, path.concat(current), idx, items);
        });
    }
    else if (node.hasOwnProperty("Keys")) {
        node.Keys.forEach((key, idx, keys) => {
            walkInternal(key, visitor, NodeType.Key, path.concat(current), idx, keys);
        });
        if (node.Val)
            walkInternal(node.Val, visitor, NodeType.Value, path.concat(current));
    }
    else if (node.hasOwnProperty("List")) {
        walkInternal(node.List, visitor, NodeType.List, path.concat(current));
    }
    else if (type === NodeType.List) {
        // value list
        node.forEach((value, idx, values) => {
            walkInternal(value, visitor, NodeType.Value, path.concat(current), idx, values);
        });
    }
}
function walk(ast, visitor) {
    return walkInternal(ast, visitor, NodeType.Unknown, []);
}
exports.walk = walk;
var AstValueType;
(function (AstValueType) {
    AstValueType[AstValueType["Map"] = 0] = "Map";
    AstValueType[AstValueType["List"] = 1] = "List";
    AstValueType[AstValueType["String"] = 2] = "String";
})(AstValueType = exports.AstValueType || (exports.AstValueType = {}));
function getText(token, options) {
    if (!token) {
        if (options && options.fallback)
            return options.fallback;
        return "";
    }
    if (options && options.stripQuotes) {
        if (token.Type === 9) {
            return token.Text.substr(1, token.Text.length - 2);
        }
    }
    return token.Text;
}
exports.getText = getText;
function getStringValue(value, fallback, options) {
    if (!value)
        return fallback;
    if (value.Token)
        return getText(value.Token, options);
    return fallback;
}
exports.getStringValue = getStringValue;
function getMapValue(value, options) {
    let astList = value.List;
    let map = new Map();
    if (!astList || !astList.Items)
        return map;
    astList.Items.forEach((item) => {
        let k = getText(item.Keys[0].Token);
        let v = getStringValue(item.Val, undefined, options);
        if (v !== undefined) {
            map.set(k, v);
        }
    });
    return map;
}
exports.getMapValue = getMapValue;
function getValueType(value) {
    if (value.Token)
        return AstValueType.String;
    let list = value.List;
    if (list.Items)
        return AstValueType.Map;
    return AstValueType.List;
}
exports.getValueType = getValueType;
function getValue(value, options) {
    if (value.Token)
        return getText(value.Token, options);
    // map
    let astList = value.List;
    if (astList.Items) {
        return getMapValue(value, options);
    }
    // array
    let tokens = value.List;
    return tokens.map((t) => getText(t.Token, options));
}
exports.getValue = getValue;
function findValue(item, name) {
    if (!name) {
        return item.Val;
    }
    let values = item.Val.List.Items;
    if (!values) {
        return null;
    }
    let value = values.find((v) => getText(v.Keys[0].Token) === name);
    if (!value)
        return null;
    return value.Val;
}
exports.findValue = findValue;
function getTokenAtPosition(ast, pos) {
    let found = null;
    walk(ast, (type, node, path) => {
        if (node.Token && path.findIndex((n) => n.type === NodeType.Value) !== -1) {
            let token = node.Token;
            if (token.Type === 9) {
                // string
                if (pos.Line !== token.Pos.Line)
                    return;
                if (token.Pos.Column < pos.Column && (token.Pos.Column + token.Text.length) > pos.Column) {
                    found = token;
                }
            }
            else if (token.Type === 10) {
                // heredoc
                const numLines = helpers_1.count(token.Text, '\n');
                if (pos.Line > token.Pos.Line && pos.Line < (token.Pos.Line + numLines)) {
                    found = token;
                }
            }
        }
    });
    return found;
}
exports.getTokenAtPosition = getTokenAtPosition;

//# sourceMappingURL=ast.js.map
