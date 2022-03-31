"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_parser_1 = require("./markdown-parser");
const markdown_provider_1 = require("./markdown-provider");
const log_1 = require("./utils/log");
const uri_1 = require("./model/uri");
const test_utils_1 = require("../test/test-utils");
log_1.Logger.setLevel('error');
const parser = markdown_parser_1.createMarkdownParser([]);
const createNoteFromMarkdown = (content, path) => parser.parse(path ? uri_1.URI.file(path) : test_utils_1.getRandomURI(), content);
describe('Link resolution', () => {
    describe('Wikilinks', () => {
        it('should resolve basename wikilinks with files in same directory', () => {
            const workspace = test_utils_1.createTestWorkspace();
            const noteA = createNoteFromMarkdown('Link to [[page b]]', './page-a.md');
            const noteB = createNoteFromMarkdown('Content of page b', './page b.md');
            workspace.set(noteA).set(noteB);
            expect(workspace.resolveLink(noteA, noteA.links[0])).toEqual(noteB.uri);
        });
        it('should resolve basename wikilinks with files in other directory', () => {
            const workspace = test_utils_1.createTestWorkspace();
            const noteA = createNoteFromMarkdown('Link to [[page b]]', './page-a.md');
            const noteB = createNoteFromMarkdown('Page b', './folder/page b.md');
            workspace.set(noteA).set(noteB);
            expect(workspace.resolveLink(noteA, noteA.links[0])).toEqual(noteB.uri);
        });
        it('should resolve wikilinks that represent an absolute path', () => {
            const workspace = test_utils_1.createTestWorkspace();
            const noteA = createNoteFromMarkdown('Link to [[/folder/page b]]', '/page-a.md');
            const noteB = createNoteFromMarkdown('Page b', '/folder/page b.md');
            workspace.set(noteA).set(noteB);
            expect(workspace.resolveLink(noteA, noteA.links[0])).toEqual(noteB.uri);
        });
        it('should resolve wikilinks that represent a relative path', () => {
            const workspace = test_utils_1.createTestWorkspace();
            const noteA = createNoteFromMarkdown('Link to [[../two/page b]]', '/path/one/page-a.md');
            const noteB = createNoteFromMarkdown('Page b', '/path/one/page b.md');
            const noteB2 = createNoteFromMarkdown('Page b 2', '/path/two/page b.md');
            workspace
                .set(noteA)
                .set(noteB)
                .set(noteB2);
            expect(workspace.resolveLink(noteA, noteA.links[0])).toEqual(noteB2.uri);
        });
        it('should resolve ambiguous wikilinks', () => {
            const workspace = test_utils_1.createTestWorkspace();
            const noteA = createNoteFromMarkdown('Link to [[page b]]', '/page-a.md');
            const noteB = createNoteFromMarkdown('Page b', '/path/one/page b.md');
            const noteB2 = createNoteFromMarkdown('Page b2', '/path/two/page b.md');
            workspace
                .set(noteA)
                .set(noteB)
                .set(noteB2);
            expect(workspace.resolveLink(noteA, noteA.links[0])).toEqual(noteB.uri);
        });
        it('should resolve path wikilink even with other ambiguous notes', () => {
            const noteA = test_utils_1.createTestNote({
                uri: '/path/to/page-a.md',
                links: [{ slug: './more/page-b' }, { slug: 'yet/page-b' }],
            });
            const noteB1 = test_utils_1.createTestNote({ uri: '/path/to/another/page-b.md' });
            const noteB2 = test_utils_1.createTestNote({ uri: '/path/to/more/page-b.md' });
            const noteB3 = test_utils_1.createTestNote({ uri: '/path/to/yet/page-b.md' });
            const ws = test_utils_1.createTestWorkspace();
            ws.set(noteA)
                .set(noteB1)
                .set(noteB2)
                .set(noteB3);
            expect(ws.resolveLink(noteA, noteA.links[0])).toEqual(noteB2.uri);
            expect(ws.resolveLink(noteA, noteA.links[1])).toEqual(noteB3.uri);
        });
        it('should resolve Foam wikilinks', () => {
            const workspace = test_utils_1.createTestWorkspace();
            const noteA = createNoteFromMarkdown('Link to [[two/page b]] and [[one/page b]]', '/page-a.md');
            const noteB = createNoteFromMarkdown('Page b', '/path/one/page b.md');
            const noteB2 = createNoteFromMarkdown('Page b2', '/path/two/page b.md');
            workspace
                .set(noteA)
                .set(noteB)
                .set(noteB2);
            expect(workspace.resolveLink(noteA, noteA.links[0])).toEqual(noteB2.uri);
            expect(workspace.resolveLink(noteA, noteA.links[1])).toEqual(noteB.uri);
        });
        it('should use wikilink definitions when available to resolve target', () => {
            const ws = test_utils_1.createTestWorkspace();
            const noteA = test_utils_1.createTestNote({
                uri: '/somewhere/from/page-a.md',
                links: [{ slug: 'page-b' }],
            });
            noteA.definitions.push({
                label: 'page-b',
                url: '../to/page-b.md',
            });
            const noteB = test_utils_1.createTestNote({
                uri: '/somewhere/to/page-b.md',
            });
            ws.set(noteA).set(noteB);
            expect(ws.resolveLink(noteA, noteA.links[0])).toEqual(noteB.uri);
        });
        it('should support case insensitive wikilink resolution', () => {
            const noteA = test_utils_1.createTestNote({
                uri: '/path/to/page-a.md',
                links: [
                    // uppercased filename, lowercased slug
                    { slug: 'page-b' },
                    // lowercased filename, camelcased wikilink
                    { slug: 'Page-C' },
                    // lowercased filename, lowercased wikilink
                    { slug: 'page-d' },
                ],
            });
            const noteB = test_utils_1.createTestNote({ uri: '/somewhere/PAGE-B.md' });
            const noteC = test_utils_1.createTestNote({ uri: '/path/another/page-c.md' });
            const noteD = test_utils_1.createTestNote({ uri: '/path/another/page-d.md' });
            const ws = test_utils_1.createTestWorkspace()
                .set(noteA)
                .set(noteB)
                .set(noteC)
                .set(noteD);
            expect(ws.resolveLink(noteA, noteA.links[0])).toEqual(noteB.uri);
            expect(ws.resolveLink(noteA, noteA.links[1])).toEqual(noteC.uri);
            expect(ws.resolveLink(noteA, noteA.links[2])).toEqual(noteD.uri);
        });
    });
    describe('Markdown direct links', () => {
        it('should support absolute path', () => {
            const noteA = test_utils_1.createTestNote({
                uri: '/path/to/page-a.md',
                links: [{ to: './another/page-b.md' }],
            });
            const noteB = test_utils_1.createTestNote({
                uri: '/path/to/another/page-b.md',
                links: [{ to: '../../to/page-a.md' }],
            });
            const ws = test_utils_1.createTestWorkspace();
            ws.set(noteA).set(noteB);
            expect(ws.resolveLink(noteA, noteA.links[0])).toEqual(noteB.uri);
        });
        it('should support relative path', () => {
            const noteA = test_utils_1.createTestNote({
                uri: '/path/to/page-a.md',
                links: [{ to: 'more/page-c.md' }],
            });
            const noteB = test_utils_1.createTestNote({
                uri: '/path/to/more/page-c.md',
            });
            const ws = test_utils_1.createTestWorkspace();
            ws.set(noteA).set(noteB);
            expect(ws.resolveLink(noteA, noteA.links[0])).toEqual(noteB.uri);
        });
        it('should default to relative path', () => {
            const noteA = test_utils_1.createTestNote({
                uri: '/path/to/page-a.md',
                links: [{ to: 'page c.md' }],
            });
            const noteB = test_utils_1.createTestNote({
                uri: '/path/to/page c.md',
            });
            const ws = test_utils_1.createTestWorkspace();
            ws.set(noteA).set(noteB);
            expect(ws.resolveLink(noteA, noteA.links[0])).toEqual(noteB.uri);
        });
    });
});
describe('Generation of markdown references', () => {
    it('should generate links without file extension when includeExtension = false', () => {
        const workspace = test_utils_1.createTestWorkspace();
        const noteA = createNoteFromMarkdown('Link to [[page-b]] and [[page-c]]', '/dir1/page-a.md');
        workspace
            .set(noteA)
            .set(createNoteFromMarkdown('Content of note B', '/dir1/page-b.md'))
            .set(createNoteFromMarkdown('Content of note C', '/dir1/page-c.md'));
        const references = markdown_provider_1.createMarkdownReferences(workspace, noteA.uri, false);
        expect(references.map(r => r.url)).toEqual(['page-b', 'page-c']);
    });
    it('should generate links with file extension when includeExtension = true', () => {
        const workspace = test_utils_1.createTestWorkspace();
        const noteA = createNoteFromMarkdown('Link to [[page-b]] and [[page-c]]', '/dir1/page-a.md');
        workspace
            .set(noteA)
            .set(createNoteFromMarkdown('Content of note B', '/dir1/page-b.md'))
            .set(createNoteFromMarkdown('Content of note C', '/dir1/page-c.md'));
        const references = markdown_provider_1.createMarkdownReferences(workspace, noteA.uri, true);
        expect(references.map(r => r.url)).toEqual(['page-b.md', 'page-c.md']);
    });
    it('should use relative paths', () => {
        const workspace = test_utils_1.createTestWorkspace();
        const noteA = createNoteFromMarkdown('Link to [[page-b]] and [[page-c]]', '/dir1/page-a.md');
        workspace
            .set(noteA)
            .set(createNoteFromMarkdown('Content of note B', '/dir2/page-b.md'))
            .set(createNoteFromMarkdown('Content of note C', '/dir3/page-c.md'));
        const references = markdown_provider_1.createMarkdownReferences(workspace, noteA.uri, true);
        expect(references.map(r => r.url)).toEqual([
            '../dir2/page-b.md',
            '../dir3/page-c.md',
        ]);
    });
});
//# sourceMappingURL=markdown-provider.test.js.map