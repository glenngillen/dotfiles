"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Position {
    constructor(_line, _character) {
        this._line = _line;
        this._character = _character;
    }
    get line() {
        return this._line;
    }
    get character() {
        return this._character;
    }
    isBefore(other) {
        if (this._line < other._line) {
            return true;
        }
        if (other._line < this._line) {
            return false;
        }
        return this._character < other._character;
    }
    translate(delta) {
        if (delta.lineDelta === undefined)
            delta.lineDelta = 0;
        if (delta.characterDelta === undefined)
            delta.characterDelta = 0;
        return new Position(this.line + delta.lineDelta, this.character + delta.characterDelta);
    }
}
exports.Position = Position;

//# sourceMappingURL=position.js.map
