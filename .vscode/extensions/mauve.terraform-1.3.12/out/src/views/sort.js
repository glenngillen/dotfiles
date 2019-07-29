"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compareTerm(left, right, groupOrder) {
    const anyIndex = groupOrder.indexOf("*");
    let leftIndex = groupOrder.indexOf(left);
    if (leftIndex === -1) {
        if (anyIndex === -1)
            return -1; // right before left
        leftIndex = anyIndex;
    }
    let rightIndex = groupOrder.indexOf(right);
    if (rightIndex === -1) {
        if (anyIndex === -1)
            return 1; // left before right
        rightIndex = anyIndex;
    }
    if (leftIndex < rightIndex)
        return -1;
    else if (leftIndex > rightIndex)
        return 1;
    return 0;
}
exports.compareTerm = compareTerm;

//# sourceMappingURL=sort.js.map
