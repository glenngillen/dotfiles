"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("../../test/test-utils");
const _1 = require(".");
const foam_core_1 = require("foam-core");
describe('Tags tree panel', () => {
    let _foam;
    let provider;
    beforeAll(async () => {
        await test_utils_1.cleanWorkspace();
        const config = foam_core_1.createConfigFromFolders([]);
        const mdProvider = new foam_core_1.MarkdownResourceProvider(new foam_core_1.Matcher(config.workspaceFolders, config.includeGlobs, config.ignoreGlobs));
        _foam = await foam_core_1.bootstrap(config, new foam_core_1.FileDataStore(), [mdProvider]);
        provider = new _1.TagsProvider(_foam, _foam.workspace);
    });
    afterAll(async () => {
        _foam.dispose();
        await test_utils_1.cleanWorkspace();
    });
    beforeEach(async () => {
        await test_utils_1.closeEditors();
    });
    it('correctly provides a tag from a set of notes', async () => {
        const noteA = test_utils_1.createTestNote({
            tags: new Set(['test']),
            uri: './note-a.md',
        });
        _foam.workspace.set(noteA);
        provider.refresh();
        const treeItems = (await provider.getChildren());
        treeItems.map(item => expect(item.tag).toContain('test'));
    });
    it('correctly handles a parent and child tag', async () => {
        const noteA = test_utils_1.createTestNote({
            tags: new Set(['parent/child']),
            uri: './note-a.md',
        });
        _foam.workspace.set(noteA);
        provider.refresh();
        const parentTreeItems = (await provider.getChildren());
        const parentTagItem = parentTreeItems.pop();
        expect(parentTagItem.title).toEqual('parent');
        expect(parentTagItem.title).not.toEqual('child');
        const childTreeItems = (await provider.getChildren(parentTagItem));
        childTreeItems.forEach(child => {
            if (child instanceof _1.Tag) {
                expect(child.title).toEqual('child');
            }
        });
    });
    it('correctly handles a single parent and multiple child tag', async () => {
        const noteA = test_utils_1.createTestNote({
            tags: new Set(['parent/child']),
            uri: './note-a.md',
        });
        _foam.workspace.set(noteA);
        const noteB = test_utils_1.createTestNote({
            tags: new Set(['parent/subchild']),
            uri: './note-b.md',
        });
        _foam.workspace.set(noteB);
        provider.refresh();
        const parentTreeItems = (await provider.getChildren());
        const parentTagItem = parentTreeItems.filter(item => item instanceof _1.Tag)[0];
        expect(parentTagItem.title).toEqual('parent');
        const childTreeItems = (await provider.getChildren(parentTagItem));
        childTreeItems.forEach(child => {
            if (child instanceof _1.Tag) {
                expect(['child', 'subchild']).toContain(child.title);
                expect(child.title).not.toEqual('parent');
            }
        });
    });
});
//# sourceMappingURL=index.spec.js.map