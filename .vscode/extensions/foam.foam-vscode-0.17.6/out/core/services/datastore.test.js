"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("../../test/test-utils");
const uri_1 = require("../model/uri");
const log_1 = require("../utils/log");
const datastore_1 = require("./datastore");
log_1.Logger.setLevel('error');
const testFolder = test_utils_1.TEST_DATA_DIR.joinPath('test-datastore');
describe('Matcher', () => {
    it('generates globs with the base dir provided', () => {
        const matcher = new datastore_1.Matcher([testFolder], ['*'], []);
        expect(matcher.folders).toEqual([datastore_1.toMatcherPathFormat(testFolder)]);
        expect(matcher.include).toEqual([
            datastore_1.toMatcherPathFormat(testFolder.joinPath('*')),
        ]);
    });
    it('defaults to including everything and excluding nothing', () => {
        const matcher = new datastore_1.Matcher([testFolder]);
        expect(matcher.exclude).toEqual([]);
        expect(matcher.include).toEqual([
            datastore_1.toMatcherPathFormat(testFolder.joinPath('**', '*')),
        ]);
    });
    it('supports multiple includes', () => {
        const matcher = new datastore_1.Matcher([testFolder], ['g1', 'g2'], []);
        expect(matcher.exclude).toEqual([]);
        expect(matcher.include).toEqual([
            datastore_1.toMatcherPathFormat(testFolder.joinPath('g1')),
            datastore_1.toMatcherPathFormat(testFolder.joinPath('g2')),
        ]);
    });
    it('has a match method to filter strings', () => {
        const matcher = new datastore_1.Matcher([testFolder], ['*.md'], []);
        const files = [
            testFolder.joinPath('file1.md'),
            testFolder.joinPath('file2.md'),
            testFolder.joinPath('file3.mdx'),
            testFolder.joinPath('sub', 'file4.md'),
        ];
        expect(matcher.match(files)).toEqual([
            testFolder.joinPath('file1.md'),
            testFolder.joinPath('file2.md'),
        ]);
    });
    it('has a isMatch method to see whether a file is matched or not', () => {
        const matcher = new datastore_1.Matcher([testFolder], ['*.md'], []);
        const files = [
            testFolder.joinPath('file1.md'),
            testFolder.joinPath('file2.md'),
            testFolder.joinPath('file3.mdx'),
            testFolder.joinPath('sub', 'file4.md'),
        ];
        expect(matcher.isMatch(files[0])).toEqual(true);
        expect(matcher.isMatch(files[1])).toEqual(true);
        expect(matcher.isMatch(files[2])).toEqual(false);
        expect(matcher.isMatch(files[3])).toEqual(false);
    });
    it('happy path', () => {
        const matcher = new datastore_1.Matcher([uri_1.URI.file('/')], ['**/*'], ['**/*.pdf']);
        expect(matcher.isMatch(uri_1.URI.file('/file.md'))).toBeTruthy();
        expect(matcher.isMatch(uri_1.URI.file('/file.pdf'))).toBeFalsy();
        expect(matcher.isMatch(uri_1.URI.file('/dir/file.md'))).toBeTruthy();
        expect(matcher.isMatch(uri_1.URI.file('/dir/file.pdf'))).toBeFalsy();
    });
    it('ignores files in the exclude list', () => {
        const matcher = new datastore_1.Matcher([testFolder], ['*.md'], ['file1.*']);
        const files = [
            testFolder.joinPath('file1.md'),
            testFolder.joinPath('file2.md'),
            testFolder.joinPath('file3.mdx'),
            testFolder.joinPath('sub', 'file4.md'),
        ];
        expect(matcher.isMatch(files[0])).toEqual(false);
        expect(matcher.isMatch(files[1])).toEqual(true);
        expect(matcher.isMatch(files[2])).toEqual(false);
        expect(matcher.isMatch(files[3])).toEqual(false);
    });
});
describe('Datastore', () => {
    it('uses the matcher to get the file list', async () => {
        const matcher = new datastore_1.Matcher([testFolder], ['**/*.md'], []);
        const ds = new datastore_1.FileDataStore();
        expect((await ds.list(matcher.include[0])).length).toEqual(4);
    });
});
//# sourceMappingURL=datastore.test.js.map