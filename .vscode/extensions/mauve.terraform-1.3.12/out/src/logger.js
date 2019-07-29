"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Level;
(function (Level) {
    Level[Level["Error"] = 0] = "Error";
    Level[Level["Warn"] = 1] = "Warn";
    Level[Level["Info"] = 2] = "Info";
    Level[Level["Debug"] = 3] = "Debug";
    Level[Level["Trace"] = 4] = "Trace";
})(Level = exports.Level || (exports.Level = {}));
function configure(output) {
    LoggingOutput.output = output;
}
exports.configure = configure;
class Logger {
    constructor(prefix) {
        this.prefix = prefix;
    }
    exception(message, error, ...params) {
        LoggingOutput.log(Level.Error, this.prefix, message, error, ...params);
    }
    error(message, ...params) {
        LoggingOutput.log(Level.Error, this.prefix, message, ...params);
    }
    warn(message, ...params) {
        LoggingOutput.log(Level.Warn, this.prefix, message, ...params);
    }
    info(message, ...params) {
        LoggingOutput.log(Level.Info, this.prefix, message, ...params);
    }
    debug(message, ...params) {
        LoggingOutput.log(Level.Debug, this.prefix, message, ...params);
    }
    trace(message, ...params) {
        LoggingOutput.log(Level.Trace, this.prefix, message, ...params);
    }
}
exports.Logger = Logger;
const isDebuggingRegex = /^--inspect(-brk)?=?/;
class LoggingOutput {
    static log(level, prefix, message, ...params) {
        const formattedPrefix = this.formatPrefix(level, prefix);
        if (this.isDebugging) {
            console.log(formattedPrefix, message, ...params);
        }
        if (!this.output) {
            return;
        }
        const lines = message.split('\n');
        for (let i = 0; i < lines.length - 1; i++)
            this.output.appendLine([formattedPrefix, lines[i]].join(" "));
        this.output.appendLine([formattedPrefix, lines[lines.length - 1], ...params].join(" "));
    }
    static formatPrefix(level, prefix) {
        function lvlStr(l) {
            switch (l) {
                case Level.Error: return "ERROR";
                case Level.Warn: return "WARN ";
                case Level.Info: return "INFO ";
                case Level.Debug: return "DEBUG";
                case Level.Trace: return "TRACE";
            }
        }
        return `${this.timestamp} [${lvlStr(level)}] ${prefix}:`;
    }
    static get timestamp() {
        const now = new Date();
        const time = now
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '');
        return `${time}:${('00' + now.getUTCMilliseconds()).slice(-3)}`;
    }
    static get isDebugging() {
        if (this._isDebugging === undefined) {
            try {
                const args = process.execArgv;
                this._isDebugging = args ? args.some(arg => isDebuggingRegex.test(arg)) : false;
            }
            catch (_a) { }
        }
        return this._isDebugging;
    }
}

//# sourceMappingURL=logger.js.map
