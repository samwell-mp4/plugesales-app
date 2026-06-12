import { readFileSync, writeFileSync } from 'fs';

let dataTs = readFileSync('src/academy/data.ts', 'utf8');
const userJson = JSON.parse(readFileSync('temp_user.json', 'utf8'));

for (const [articleId, blocks] of Object.entries(userJson)) {
  // Build the marker: the line starting with article key
  const startMarker = `  '${articleId}': {\n`;
  const startIdx = dataTs.indexOf(startMarker);
  if (startIdx === -1) {
    console.log(`NOT FOUND: ${articleId}`);
    continue;
  }

  // Find "blocks: [" after startMarker
  const blocksStart = dataTs.indexOf('    blocks: [\n', startIdx);
  if (blocksStart === -1) {
    console.log(`BLOCKS NOT FOUND: ${articleId}`);
    continue;
  }

  // Find the matching "],\n  }," that closes the article
  // We need to find the  ],  that closes the blocks array and the  },  that closes the article
  const afterBlocks = dataTs.indexOf('\n    ],\n  },\n', blocksStart);
  if (afterBlocks === -1) {
    console.log(`CLOSING NOT FOUND: ${articleId}`);
    continue;
  }
  const endIdx = afterBlocks + '\n    ],\n  },\n'.length;

  // Format the blocks as TypeScript (single quotes, no quotes on keys)
  const blocksTS = JSON.stringify(blocks, null, 2)
    .split('\n')
    .map(line => '      ' + line)
    .join('\n')
    .replace(/"([^"]+)":\s*/g, (m, k) => {
      if (k === 'src' || k === 'caption' || k === 'html' || k === 'text' || k === 'title' || k === 'heading' || k === 'variant' || k === 'icon' || k === 'type' || k === 'id' || k === 'role' || k === 'desc' || k === 'name' || k === 'stages') {
        return `${k}: `;
      }
      // Check if it's an object value or a string
      return `${k}: `;
    })
    .trimStart();

  const oldArticle = dataTs.slice(blocksStart, endIdx);
  const newArticle = `    blocks: [\n${blocksTS}\n    ],\n  },\n`;

  dataTs = dataTs.slice(0, blocksStart) + newArticle + dataTs.slice(endIdx);
  console.log(`REPLACED: ${articleId}`);
}

writeFileSync('src/academy/data.ts', dataTs, 'utf8');
console.log('DONE');
