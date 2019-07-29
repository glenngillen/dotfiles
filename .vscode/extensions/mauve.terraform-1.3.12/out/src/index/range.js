"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Range {
    constructor(_start, _end) {
        this._start = _start;
        this._end = _end;
    }
    get start() {
        return this._start;
    }
    get end() {
        return this._end;
    }
    contains(p) {
        return this._start.isBefore(p) && p.isBefore(this._end);
    }
}
exports.Range = Range;

//# sourceMappingURL=range.js.map
