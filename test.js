import {remark} from 'remark';
import {remarkImportCode} from './index.js';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {readFile} from 'node:fs/promises';
import tap from 'tap';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, 'fixtures');

function extractCodeContent(markdown) {
	const match = markdown.match(/```[^\n]*\n([\s\S]*?)```/);
	return match ? match[1].trim() : markdown.trim();
}

tap.test('remark-source-code', async (t) => {
	t.test('should import code from local files', async (t) => {
		const file = await remark().use(remarkImportCode, {baseDir: fixtures})
			.process(`
\`\`\`js src="test.js"
\`\`\`
		`);

		const expected = await readFile(join(fixtures, 'test.js'), 'utf-8');
		t.equal(extractCodeContent(file.value), expected.trim());
	});

	t.test('should handle local file errors', async (t) => {
		const file = await remark().use(remarkImportCode, {baseDir: fixtures})
			.process(`
\`\`\`js src="nonexistent.js"
\`\`\`
		`);

		t.match(
			extractCodeContent(file.value),
			/Error loading local file from nonexistent\.js/,
			'should include error message'
		);
	});

	t.test('should preserve other meta attributes', async (t) => {
		const file = await remark().use(remarkImportCode, {baseDir: fixtures})
			.process(`
\`\`\`js src="test.js" title="Test File"
\`\`\`
		`);

		t.match(file.value, /title="Test File"/, 'should preserve title attribute');
	});

	t.test('should import code from remote URLs', async (t) => {
		const file = await remark().use(remarkImportCode).process(`
\`\`\`js src="https://raw.githubusercontent.com/anubra266/remark-source-code/refs/heads/main/fixtures/test.js"
\`\`\`
		`);

		const expected = await readFile(join(fixtures, 'test.js'), 'utf-8');
		t.equal(extractCodeContent(file.value), expected.trim());
	});

	t.test('should handle remote URL errors', async (t) => {
		const file = await remark().use(remarkImportCode).process(`
\`\`\`js src="https://example.com/nonexistent.js"
\`\`\`
		`);

		t.match(
			extractCodeContent(file.value),
			/Error loading remote code from https:\/\/example\.com\/nonexistent\.js/,
			'should include error message for failed fetch'
		);
	});

	t.test('should handle code blocks without src attribute', async (t) => {
		const input = `
\`\`\`js
console.log('hello')
\`\`\`
		`;
		const file = await remark().use(remarkImportCode).process(input);

		t.equal(extractCodeContent(file.value), "console.log('hello')");
	});
});
