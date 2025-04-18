import path from 'node:path';
import {visit} from 'unist-util-visit';
import fetch from 'node-fetch';
import fs from 'node:fs/promises';

/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Code} Code
 */

/**
 * @typedef {Object} RemarkSourceCodeOptions
 * @property {string} [baseDir] - Base directory for resolving local file paths
 */

/**
 * Plugin to import code from local files or remote URLs
 * @param {RemarkSourceCodeOptions} [options={}]
 * @returns {(tree: Root) => Promise<void>}
 */
export function remarkSourceCode(options = {}) {
	const baseDir = options.baseDir || process.cwd();

	return async function transformer(tree) {
		/**
		 * @type {Promise<void>[]}
		 */
		const promises = [];

		visit(tree, 'code', (node) => {
			const {meta} = node;
			if (!meta) return;

			// Check for src attribute
			const srcMatch = meta.match(/src="([^"]+)"/);
			if (!srcMatch) return;

			const source = srcMatch[1];
			const cleanedMeta = meta.replace(srcMatch[0], '').trim();

			let promise;

			// Handle remote URLs
			if (source.startsWith('http://') || source.startsWith('https://')) {
				promise = fetch(source)
					.then((res) => {
						if (!res.ok) {
							throw new Error(`Failed to fetch ${source}: ${res.statusText}`);
						}
						return res.text();
					})
					.then((code) => {
						node.value = code;
						node.meta = cleanedMeta;
					})
					.catch((err) => {
						node.value = `// Error loading remote code from ${source}\n// ${err.message}`;
						node.meta = cleanedMeta;
					});
			}
			// Handle local files
			else {
				const filePath = path.resolve(baseDir, source);
				promise = fs
					.readFile(filePath, 'utf-8')
					.then((code) => {
						node.value = code;
						node.meta = cleanedMeta;
					})
					.catch((err) => {
						node.value = `// Error loading local file from ${source}\n// ${err.message}`;
						node.meta = cleanedMeta;
					});
			}

			promises.push(promise);
		});

		await Promise.all(promises);
	};
}
