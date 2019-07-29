"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ai = require("applicationinsights");
const os = require("os");
const vscode = require("vscode");
const configuration_1 = require("./configuration");
const logger_1 = require("./logger");
class TelemetryReporter extends vscode.Disposable {
    constructor(extensionId, extensionVersion, aiKey) {
        super(() => this.disposables.map((d) => d.dispose()));
        this.extensionId = extensionId;
        this.extensionVersion = extensionVersion;
        this.aiKey = aiKey;
        this.userOptIn = false;
        this.disposables = [];
        this.logger = new logger_1.Logger("telemetry");
        if (!aiKey || aiKey === "")
            return;
        this.updateUserOptIn();
    }
    get enabled() {
        return this.userOptIn;
    }
    trackEvent(eventName, properties, measurements) {
        if (!this.userOptIn || !this.client || !eventName) {
            this.logger.debug(`Not sending metric ${eventName}`);
            if (properties) {
                Object.keys(properties).forEach((p) => this.logger.debug(`    ${p}: ${properties[p]}`));
            }
            if (measurements) {
                Object.keys(measurements).forEach((p) => this.logger.debug(`    ${p}: ${measurements[p]}`));
            }
            return;
        }
        this.client.trackEvent({
            name: `${eventName}`,
            properties: properties,
            measurements: measurements
        });
    }
    trackException(eventName, exception, properties, measurements) {
        if (!this.userOptIn || !this.client || !exception || !eventName) {
            this.logger.debug(`terraform.telemetry: Not sending exception metric ${eventName}/${exception}`);
            return;
        }
        if (!properties)
            properties = {};
        properties.name = `${eventName}`;
        this.client.trackException({
            exception: exception,
            properties: properties,
            measurements: measurements
        });
    }
    dispose() {
        return new Promise(resolve => {
            if (this.client) {
                this.client.flush({
                    callback: () => {
                        // all data flushed
                        this.client = undefined;
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
    }
    updateUserOptIn() {
        const globalConfig = vscode.workspace.getConfiguration('telemetry');
        const globalOptIn = globalConfig.get('enableTelemetry', true);
        const extensionOptIn = configuration_1.getConfiguration().telemetry.enabled;
        const optIn = globalOptIn && extensionOptIn;
        if (this.userOptIn !== optIn) {
            this.userOptIn = optIn;
            if (this.userOptIn) {
                this.createClient();
            }
            else {
                this.dispose();
            }
        }
    }
    createClient() {
        // check if another instance exists
        if (ai.defaultClient) {
            this.client = new ai.TelemetryClient(this.aiKey);
            this.client.channel.setUseDiskRetryCaching(true);
        }
        else {
            ai.setup(this.aiKey)
                .setAutoCollectConsole(false)
                .setAutoCollectDependencies(false)
                .setAutoCollectExceptions(false)
                .setAutoCollectPerformance(false)
                .setAutoCollectRequests(false)
                .setAutoDependencyCorrelation(false)
                .setUseDiskRetryCaching(true)
                .start();
            this.client = ai.defaultClient;
        }
        this.setCommonProperties();
        this.client.context.tags[this.client.context.keys.sessionId] = vscode.env.sessionId;
        this.client.context.tags[this.client.context.keys.userId] = vscode.env.machineId;
    }
    setCommonProperties() {
        this.client.commonProperties = {
            'common.os': os.platform(),
            'common.platformversion': (os.release() || '').replace(/^(\d+)(\.\d+)?(\.\d+)?(.*)/, '$1$2$3'),
            'common.extname': this.extensionId,
            'common.extversion': this.extensionVersion,
            'common.vscodemachineid': vscode.env.machineId,
            'common.vscodesessionid': vscode.env.sessionId,
            'common.vscodeversion': vscode.version
        };
    }
}
function activate(ctx) {
    const packageJson = require(ctx.asAbsolutePath('./package.json'));
    const aiKey = require('./constants.json').APPINSIGHTS_KEY;
    exports.Reporter = new TelemetryReporter(`${packageJson.publisher}.${packageJson.name}`, packageJson.version, aiKey);
}
exports.activate = activate;
function deactivate() {
    return exports.Reporter.dispose();
}
exports.deactivate = deactivate;

//# sourceMappingURL=telemetry.js.map
