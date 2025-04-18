# remark-source-code

[![npm version](https://badge.fury.io/js/remark-source-code.svg)](https://badge.fury.io/js/remark-source-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A remark plugin to import code from local files or remote URLs into your markdown.

## Installation

```bash
npm install remark-source-code
```

## Usage

```js
import {remark} from 'remark';
import remarkSourceCode from 'remark-source-code';

const file = await remark().use(remarkSourceCode, {baseDir: './src'}).process(`
\`\`\`js src="example.js"
\`\`\`

\`\`\`js src="https://example.com/remote.js"
\`\`\`
`);
```

## API

### `remarkSourceCode(options?)`

#### `options`

Type: `object`

##### `baseDir`

Type: `string`
Default: `process.cwd()`

Base directory for resolving local file paths.

## Examples

### Local Files

```markdown
\`\`\`js src="path/to/file.js"
\`\`\`
```

### Remote URLs

```markdown
\`\`\`js src="https://example.com/code.js"
\`\`\`
```

### With Language and Other Meta

```markdown
\`\`\`js src="example.js" title="Example Code"
\`\`\`
```

## Sponsors

Thanks goes to these wonderful people

<p align="center">
  <a href="https://patreon.com/anubra266?utm_medium=clipboard_copy&utm_source=copyLink&
  utm_campaign=creatorshare_creator&utm_content=join_link">
    <img src='https://cdn.jsdelivr.net/gh/anubra266/static@main/sponsors.svg'/>
  </a>
</p>

## License

MIT © [anubra266](https://github.com/anubra266)
