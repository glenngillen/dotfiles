"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awsResources = require("../data/terraform-provider-aws.json");
const azureResources = require("../data/terraform-provider-azurerm.json");
const googleResources = require("../data/terraform-provider-google.json");
const ociResources = require("../data/terraform-provider-oci.json");
exports.terraformConfigAutoComplete = require("../data/terraform-config.json");
const _ = require("lodash");
exports.allProviders = _.merge({}, awsResources, azureResources, googleResources, ociResources);
function findResourceFormat(sectionType, resourceType) {
    let types = exports.allProviders[sectionType];
    if (!types)
        return null;
    return types[resourceType];
}
exports.findResourceFormat = findResourceFormat;

//# sourceMappingURL=model.js.map
