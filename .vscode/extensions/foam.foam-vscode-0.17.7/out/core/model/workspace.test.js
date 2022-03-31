"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workspace_1 = require("./workspace");
const log_1 = require("../utils/log");
const uri_1 = require("./uri");
const test_utils_1 = require("../../test/test-utils");
log_1.Logger.setLevel('error');
describe('Workspace resources', () => {
    it('should allow adding notes to the workspace', () => {
        const ws = test_utils_1.createTestWorkspace();
        ws.set(test_utils_1.createTestNote({ uri: '/page-a.md' }));
        ws.set(test_utils_1.createTestNote({ uri: '/page-b.md' }));
        ws.set(test_utils_1.createTestNote({ uri: '/page-c.md' }));
        expect(ws
            .list()
            .map(n => n.uri.path)
            .sort()).toEqual(['/page-a.md', '/page-b.md', '/page-c.md']);
    });
    it('should includes all notes when listing resources', () => {
        const ws = test_utils_1.createTestWorkspace();
        ws.set(test_utils_1.createTestNote({ uri: '/page-a.md' }));
        ws.set(test_utils_1.createTestNote({ uri: '/file.pdf' }));
        expect(ws
            .list()
            .map(n => n.uri.path)
            .sort()).toEqual(['/file.pdf', '/page-a.md']);
    });
    it('should fail when trying to get a non-existing note', () => {
        const noteA = test_utils_1.createTestNote({
            uri: '/path/to/page-a.md',
        });
        const ws = test_utils_1.createTestWorkspace();
        ws.set(noteA);
        const uri = uri_1.URI.file('/path/to/another/page-b.md');
        expect(ws.exists(uri)).toBeFalsy();
        expect(ws.find(uri)).toBeNull();
        expect(() => ws.get(uri)).toThrow();
    });
    it('should work with a resource named like a JS prototype property', () => {
        const ws = test_utils_1.createTestWorkspace();
        const noteA = test_utils_1.createTestNote({ uri: '/somewhere/constructor.md' });
        ws.set(noteA);
        expect(ws.list()).toEqual([noteA]);
    });
    it('should not return files with same suffix when listing by ID - #851', () => {
        const ws = test_utils_1.createTestWorkspace()
            .set(test_utils_1.createTestNote({ uri: 'test-file.md' }))
            .set(test_utils_1.createTestNote({ uri: 'file.md' }));
        expect(ws.listByIdentifier('file').length).toEqual(1);
    });
    it('should support dendron-style names', () => {
        const ws = test_utils_1.createTestWorkspace()
            .set(test_utils_1.createTestNote({ uri: 'note.pdf' }))
            .set(test_utils_1.createTestNote({ uri: 'note.md' }))
            .set(test_utils_1.createTestNote({ uri: 'note.yo.md' }))
            .set(test_utils_1.createTestNote({ uri: 'note2.md' }));
        for (const [reference, path] of [
            ['note', '/note.md'],
            ['note.md', '/note.md'],
            ['note.yo', '/note.yo.md'],
            ['note.yo.md', '/note.yo.md'],
            ['note.pdf', '/note.pdf'],
            ['note2', '/note2.md'],
        ]) {
            expect(ws.listByIdentifier(reference)[0].uri.path).toEqual(path);
            expect(ws.find(reference).uri.path).toEqual(path);
        }
    });
    it('should keep the fragment information when finding a resource', () => {
        const ws = test_utils_1.createTestWorkspace()
            .set(test_utils_1.createTestNote({ uri: 'test-file.md' }))
            .set(test_utils_1.createTestNote({ uri: 'file.md' }));
        const res = ws.find('test-file#my-section');
        expect(res.uri.fragment).toEqual('my-section');
    });
});
describe('Identifier computation', () => {
    it('should compute the minimum identifier to resolve a name clash', () => {
        const first = test_utils_1.createTestNote({
            uri: '/path/to/page-a.md',
        });
        const second = test_utils_1.createTestNote({
            uri: '/another/way/for/page-a.md',
        });
        const third = test_utils_1.createTestNote({
            uri: '/another/path/for/page-a.md',
        });
        const ws = new workspace_1.FoamWorkspace()
            .set(first)
            .set(second)
            .set(third);
        expect(ws.getIdentifier(first.uri)).toEqual('to/page-a');
        expect(ws.getIdentifier(second.uri)).toEqual('way/for/page-a');
        expect(ws.getIdentifier(third.uri)).toEqual('path/for/page-a');
    });
    it('should support sections in identifier computation', () => {
        const first = test_utils_1.createTestNote({
            uri: '/path/to/page-a.md',
        });
        const second = test_utils_1.createTestNote({
            uri: '/another/way/for/page-a.md',
        });
        const third = test_utils_1.createTestNote({
            uri: '/another/path/for/page-a.md',
        });
        const ws = new workspace_1.FoamWorkspace()
            .set(first)
            .set(second)
            .set(third);
        expect(ws.getIdentifier(first.uri.withFragment('section name'))).toEqual('to/page-a#section name');
    });
    const needle = '/project/car/todo';
    test.each([
        [['/project/home/todo', '/other/todo', '/something/else'], 'car/todo'],
        [['/family/car/todo', '/other/todo'], 'project/car/todo'],
        [[], 'todo'],
    ])('should find shortest identifier', (haystack, id) => {
        expect(workspace_1.FoamWorkspace.getShortestIdentifier(needle, haystack)).toEqual(id);
    });
    it('should ignore same string in haystack', () => {
        const haystack = [
            needle,
            '/project/home/todo',
            '/other/todo',
            '/something/else',
        ];
        const identifier = workspace_1.FoamWorkspace.getShortestIdentifier(needle, haystack);
        expect(identifier).toEqual('car/todo');
    });
    it('should return the best guess when no solution is possible', () => {
        /**
         * In this case there is no way to uniquely identify the element,
         * our fallback is to just return the "least wrong" result, basically
         * a full identifier
         * This is an edge case that should never happen in a real repo
         */
        const haystack = [
            '/parent/' + needle,
            '/project/home/todo',
            '/other/todo',
            '/something/else',
        ];
        const identifier = workspace_1.FoamWorkspace.getShortestIdentifier(needle, haystack);
        expect(identifier).toEqual('project/car/todo');
    });
});
//# sourceMappingURL=workspace.test.js.map