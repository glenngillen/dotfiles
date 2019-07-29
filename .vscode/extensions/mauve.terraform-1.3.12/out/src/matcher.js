"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fuzzyMatch(value, test) {
    if (typeof test === "string")
        return value.indexOf(test) !== -1;
    return test.findIndex(t => value.indexOf(t) !== -1) !== -1;
}
function prefixMatch(value, test) {
    if (typeof test === "string")
        return value.indexOf(test) === 0;
    return test.findIndex(t => value.indexOf(t) === 0) !== -1;
}
function exactMatch(value, test) {
    if (typeof test === "string")
        return value === test;
    return test.indexOf(value) !== -1;
}
function matchHelper(type, value, test) {
    switch (type) {
        case "FUZZY":
            return fuzzyMatch(value, test);
        case "PREFIX":
            return prefixMatch(value, test);
        case "EXACT":
            return exactMatch(value, test);
    }
}
function match(value, expression, defaultType = "FUZZY") {
    if (!value)
        return null;
    if (typeof expression === "string")
        expression = {
            type: defaultType,
            match: expression
        };
    const expressionMatches = matchHelper(expression.type, value, expression.match);
    if (expression.exclude)
        return !expressionMatches;
    return expressionMatches;
}
exports.match = match;

//# sourceMappingURL=matcher.js.map
