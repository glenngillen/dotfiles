"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./configuration");
const logger_1 = require("./logger");
let runner;
function liveIndexEnabledForDocument(cfg, doc) {
    if (doc.languageId !== "terraform") {
        return false;
    }
    return cfg.enabled && cfg.liveIndexing;
}
function liveIndex(index, e) {
    const logger = new logger_1.Logger("live-index");
    const cfg = configuration_1.getConfiguration().indexing;
    if (!liveIndexEnabledForDocument(cfg, e.document)) {
        return;
    }
    if (runner != null) {
        clearTimeout(runner);
    }
    runner = setTimeout(function () {
        try {
            index.indexDocument(e.document);
        }
        catch (error) {
            logger.warn("Live index failed", error);
        }
    }, cfg.liveIndexingDelay);
}
exports.liveIndex = liveIndex;

//# sourceMappingURL=live.js.map
