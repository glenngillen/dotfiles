"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const templates_1 = require("../services/templates");
const variable_resolver_1 = require("../services/variable-resolver");
async function offerToCreateTemplate() {
    const response = await vscode_1.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'No templates available. Would you like to create one instead?',
    });
    if (response === 'Yes') {
        vscode_1.commands.executeCommand('foam-vscode.create-new-template');
        return;
    }
}
function sortTemplatesMetadata(t1, t2) {
    // Sort by name's existence, then name, then path
    if (t1.get('name') === undefined && t2.get('name') !== undefined) {
        return 1;
    }
    if (t1.get('name') !== undefined && t2.get('name') === undefined) {
        return -1;
    }
    const pathSortOrder = t1
        .get('templatePath')
        .localeCompare(t2.get('templatePath'));
    if (t1.get('name') === undefined && t2.get('name') === undefined) {
        return pathSortOrder;
    }
    const nameSortOrder = t1.get('name').localeCompare(t2.get('name'));
    return nameSortOrder || pathSortOrder;
}
async function askUserForTemplate() {
    const templates = await templates_1.getTemplates();
    if (templates.length === 0) {
        return offerToCreateTemplate();
    }
    const templatesMetadata = (await Promise.all(templates.map(async (templateUri) => {
        const metadata = await templates_1.getTemplateMetadata(templateUri);
        metadata.set('templatePath', templateUri.getBasename());
        return metadata;
    }))).sort(sortTemplatesMetadata);
    const items = await Promise.all(templatesMetadata.map(metadata => {
        const label = metadata.get('name') || metadata.get('templatePath');
        const description = metadata.get('name')
            ? metadata.get('templatePath')
            : null;
        const detail = metadata.get('description');
        const item = {
            label: label,
            description: description,
            detail: detail,
        };
        Object.keys(item).forEach(key => {
            if (!item[key]) {
                delete item[key];
            }
        });
        return item;
    }));
    return await vscode_1.window.showQuickPick(items, {
        placeHolder: 'Select a template to use.',
    });
}
const feature = {
    activate: (context) => {
        context.subscriptions.push(vscode_1.commands.registerCommand('foam-vscode.create-note-from-template', async () => {
            const selectedTemplate = await askUserForTemplate();
            if (selectedTemplate === undefined) {
                return;
            }
            const templateFilename = selectedTemplate.description ||
                selectedTemplate.label;
            const templateUri = templates_1.TEMPLATES_DIR.joinPath(templateFilename);
            const resolver = new variable_resolver_1.Resolver(new Map(), new Date());
            await templates_1.NoteFactory.createFromTemplate(templateUri, resolver);
        }));
        context.subscriptions.push(vscode_1.commands.registerCommand('foam-vscode.create-note-from-default-template', () => {
            const resolver = new variable_resolver_1.Resolver(new Map(), new Date());
            templates_1.NoteFactory.createFromTemplate(templates_1.DEFAULT_TEMPLATE_URI, resolver, undefined, `---
foam_template:
  name: New Note
  description: Foam's default new note template
---
# \${FOAM_TITLE}

\${FOAM_SELECTED_TEXT}
`);
        }));
        context.subscriptions.push(vscode_1.commands.registerCommand('foam-vscode.create-new-template', templates_1.createTemplate));
    },
};
exports.default = feature;
//# sourceMappingURL=create-from-template.js.map