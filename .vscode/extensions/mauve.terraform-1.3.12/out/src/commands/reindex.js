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
const command_1 = require("./command");
class ReindexCommand extends command_1.Command {
    constructor(index, watcher, ctx) {
        super("reindex", ctx, command_1.CommandType.PALETTE);
        this.index = index;
        this.watcher = watcher;
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            this.index.clear();
            if (this.watcher)
                return yield this.watcher.crawl();
        });
    }
}
exports.ReindexCommand = ReindexCommand;

//# sourceMappingURL=reindex.js.map
