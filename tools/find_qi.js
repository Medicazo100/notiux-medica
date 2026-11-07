const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'Home-3HiaJ6xE.js');
const content = fs.readFileSync(file, 'utf8');

// Find references to Qi(
const matches = [];
let pos = 0;
while ((pos = content.indexOf('Qi', pos)) !== -1) {
  const snippet = content.slice(Math.max(0, pos - 50), pos + 100);
  if (snippet.includes('jsx') || snippet.includes('paths:')) {
    matches.push(snippet);
  }
  pos += 2;
}
console.log('Matches with Qi:', matches);
