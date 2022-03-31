"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_parser_1 = require("./markdown-parser");
const log_1 = require("../utils/log");
const uri_1 = require("../model/uri");
const range_1 = require("../model/range");
const test_utils_1 = require("../../test/test-utils");
log_1.Logger.setLevel('error');
const parser = markdown_parser_1.createMarkdownParser([]);
const createNoteFromMarkdown = (content, path) => parser.parse(path ? uri_1.URI.file(path) : test_utils_1.getRandomURI(), content);
describe('Markdown parsing', () => {
    it('should create a Resource from a markdown file', () => {
        const note = createNoteFromMarkdown('Note content', '/a/path.md');
        expect(note.uri).toEqual(uri_1.URI.file('/a/path.md'));
    });
    describe('Links', () => {
        it('should skip external links', () => {
            const note = createNoteFromMarkdown(`this is a [link to google](https://www.google.com)`);
            expect(note.links.length).toEqual(0);
        });
        it('should skip links to a section within the file', () => {
            const note = createNoteFromMarkdown(`this is a [link to intro](#introduction)`);
            expect(note.links.length).toEqual(0);
        });
        it('should detect regular markdown links', () => {
            const note = createNoteFromMarkdown('this is a [link to page b](../doc/page-b.md)');
            expect(note.links.length).toEqual(1);
            const link = note.links[0];
            expect(link.type).toEqual('link');
            expect(link.label).toEqual('link to page b');
            expect(link.rawText).toEqual('[link to page b](../doc/page-b.md)');
            expect(link.target).toEqual('../doc/page-b.md');
        });
        it('should detect links that have formatting in label', () => {
            const note = createNoteFromMarkdown('this is [**link** with __formatting__](../doc/page-b.md)');
            expect(note.links.length).toEqual(1);
            const link = note.links[0];
            expect(link.type).toEqual('link');
            expect(link.label).toEqual('link with formatting');
            expect(link.target).toEqual('../doc/page-b.md');
        });
        it('should detect wikilinks', () => {
            const note = createNoteFromMarkdown('Some content and [[a link]] to [[a file]]');
            expect(note.links.length).toEqual(2);
            let link = note.links[0];
            expect(link.type).toEqual('wikilink');
            expect(link.rawText).toEqual('[[a link]]');
            expect(link.label).toEqual('a link');
            expect(link.target).toEqual('a link');
            link = note.links[1];
            expect(link.type).toEqual('wikilink');
            expect(link.rawText).toEqual('[[a file]]');
            expect(link.label).toEqual('a file');
            expect(link.target).toEqual('a file');
        });
        it('should detect wikilinks that have aliases', () => {
            const note = createNoteFromMarkdown('this is [[link|link alias]]. A link with spaces [[other link | spaced]]');
            expect(note.links.length).toEqual(2);
            let link = note.links[0];
            expect(link.type).toEqual('wikilink');
            expect(link.rawText).toEqual('[[link|link alias]]');
            expect(link.label).toEqual('link alias');
            expect(link.target).toEqual('link');
            link = note.links[1];
            expect(link.type).toEqual('wikilink');
            expect(link.rawText).toEqual('[[other link | spaced]]');
            expect(link.label).toEqual('spaced');
            expect(link.target).toEqual('other link');
        });
        it('should skip wikilinks in codeblocks', () => {
            const noteA = createNoteFromMarkdown(`
this is some text with our [[first-wikilink]].

\`\`\`
this is inside a [[codeblock]]
\`\`\`

this is some text with our [[second-wikilink]].
    `);
            expect(noteA.links.map(l => l.label)).toEqual([
                'first-wikilink',
                'second-wikilink',
            ]);
        });
        it('should skip wikilinks in inlined codeblocks', () => {
            const noteA = createNoteFromMarkdown(`
this is some text with our [[first-wikilink]].

this is \`inside a [[codeblock]]\`

this is some text with our [[second-wikilink]].
    `);
            expect(noteA.links.map(l => l.label)).toEqual([
                'first-wikilink',
                'second-wikilink',
            ]);
        });
    });
    describe('Note Title', () => {
        it('should initialize note title if heading exists', () => {
            const note = createNoteFromMarkdown(`
# Page A
this note has a title
    `);
            expect(note.title).toBe('Page A');
        });
        it('should support wikilinks and urls in title', () => {
            const note = createNoteFromMarkdown(`
# Page A with [[wikilink]] and a [url](https://google.com)
this note has a title
    `);
            expect(note.title).toBe('Page A with wikilink and a url');
        });
        it('should default to file name if heading does not exist', () => {
            const note = createNoteFromMarkdown(`This file has no heading.`, '/page-d.md');
            expect(note.title).toEqual('page-d');
        });
        it('should give precedence to frontmatter title over other headings', () => {
            const note = createNoteFromMarkdown(`
---
title: Note Title
date: 20-12-12
---

# Other Note Title
    `);
            expect(note.title).toBe('Note Title');
        });
        it('should support numbers as title', () => {
            const note1 = createNoteFromMarkdown(`hello`, '/157.md');
            expect(note1.title).toBe('157');
            const note2 = createNoteFromMarkdown(`# 158`, '/157.md');
            expect(note2.title).toBe('158');
            const note3 = createNoteFromMarkdown(`
---
title: 159
---

# 158
`, '/157.md');
            expect(note3.title).toBe('159');
        });
        it('should support empty titles (see #276)', () => {
            const note = createNoteFromMarkdown(`
#

this note has an empty title line
    `, '/Hello Page.md');
            expect(note.title).toEqual('Hello Page');
        });
    });
    describe('Frontmatter', () => {
        it('should parse yaml frontmatter', () => {
            const note = createNoteFromMarkdown(`
---
title: Note Title
date: 20-12-12
---

# Other Note Title`);
            expect(note.properties.title).toBe('Note Title');
            expect(note.properties.date).toBe('20-12-12');
        });
        it('should parse empty frontmatter', () => {
            const note = createNoteFromMarkdown(`
---
---

# Empty Frontmatter
`);
            expect(note.properties).toEqual({});
        });
        it('should not fail when there are issues with parsing frontmatter', () => {
            const note = createNoteFromMarkdown(`
---
title: - one
 - two
 - #
---

`);
            expect(note.properties).toEqual({});
        });
    });
    describe('Tags', () => {
        it('can find tags in the text of the note', () => {
            const noteA = createNoteFromMarkdown(`
# this is a #heading
#this is some #text that includes #tags we #care-about.
    `);
            expect(noteA.tags).toEqual([
                { label: 'heading', range: range_1.Range.create(1, 12, 1, 20) },
                { label: 'this', range: range_1.Range.create(2, 0, 2, 5) },
                { label: 'text', range: range_1.Range.create(2, 14, 2, 19) },
                { label: 'tags', range: range_1.Range.create(2, 34, 2, 39) },
                { label: 'care-about', range: range_1.Range.create(2, 43, 2, 54) },
            ]);
        });
        it('will skip tags in codeblocks', () => {
            const noteA = createNoteFromMarkdown(`
this is some #text that includes #tags we #care-about.

\`\`\`
this is a #codeblock
\`\`\`
    `);
            expect(noteA.tags.map(t => t.label)).toEqual([
                'text',
                'tags',
                'care-about',
            ]);
        });
        it('will skip tags in inlined codeblocks', () => {
            const noteA = createNoteFromMarkdown(`
this is some #text that includes #tags we #care-about.
this is a \`inlined #codeblock\` `);
            expect(noteA.tags.map(t => t.label)).toEqual([
                'text',
                'tags',
                'care-about',
            ]);
        });
        it('can find tags as text in yaml', () => {
            const noteA = createNoteFromMarkdown(`
---
tags: hello, world  this_is_good
---
# this is a heading
this is some #text that includes #tags we #care-about.
    `);
            expect(noteA.tags.map(t => t.label)).toEqual([
                'hello',
                'world',
                'this_is_good',
                'text',
                'tags',
                'care-about',
            ]);
        });
        it('can find tags as array in yaml', () => {
            const noteA = createNoteFromMarkdown(`
---
tags: [hello, world,  this_is_good]
---
# this is a heading
this is some #text that includes #tags we #care-about.
    `);
            expect(noteA.tags.map(t => t.label)).toEqual([
                'hello',
                'world',
                'this_is_good',
                'text',
                'tags',
                'care-about',
            ]);
        });
        it('provides rough range for tags in yaml', () => {
            // For now it's enough to just get the YAML block range
            // in the future we might want to be more specific
            const noteA = createNoteFromMarkdown(`
---
tags: [hello, world, this_is_good]
---
# this is a heading
this is some text
    `);
            expect(noteA.tags[0]).toEqual({
                label: 'hello',
                range: range_1.Range.create(1, 0, 3, 3),
            });
        });
    });
    describe('Sections', () => {
        it('should find sections within the note', () => {
            const note = createNoteFromMarkdown(`
# Section 1

This is the content of section 1.

## Section 1.1

This is the content of section 1.1.

# Section 2

This is the content of section 2.
      `);
            expect(note.sections).toHaveLength(3);
            expect(note.sections[0].label).toEqual('Section 1');
            expect(note.sections[0].range).toEqual(range_1.Range.create(1, 0, 9, 0));
            expect(note.sections[1].label).toEqual('Section 1.1');
            expect(note.sections[1].range).toEqual(range_1.Range.create(5, 0, 9, 0));
            expect(note.sections[2].label).toEqual('Section 2');
            expect(note.sections[2].range).toEqual(range_1.Range.create(9, 0, 13, 0));
        });
        it('should support wikilinks and links in the section label', () => {
            const note = createNoteFromMarkdown(`
# Section with [[wikilink]]

This is the content of section with wikilink

## Section with [url](https://google.com)

This is the content of section with url`);
            expect(note.sections).toHaveLength(2);
            expect(note.sections[0].label).toEqual('Section with wikilink');
            expect(note.sections[1].label).toEqual('Section with url');
        });
    });
    describe('Parser plugins', () => {
        const testPlugin = {
            visit: (node, note) => {
                if (node.type === 'heading') {
                    note.properties.hasHeading = true;
                }
            },
        };
        const parser = markdown_parser_1.createMarkdownParser([testPlugin]);
        it('can augment the parsing of the file', () => {
            const note1 = parser.parse(uri_1.URI.file('/path/to/a'), `
This is a test note without headings.
But with some content.
`);
            expect(note1.properties.hasHeading).toBeUndefined();
            const note2 = parser.parse(uri_1.URI.file('/path/to/a'), `
# This is a note with header
and some content`);
            expect(note2.properties.hasHeading).toBeTruthy();
        });
    });
});
//# sourceMappingURL=markdown-parser.test.js.map