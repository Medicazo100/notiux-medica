const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'Home-3HiaJ6xE.js');
const content = fs.readFileSync(file, 'utf8');

// Find references to greeting, or start tabs
const idx = content.indexOf('start.title');
console.log('start.title index in Home:', idx);
if (idx !== -1) {
  console.log(content.slice(Math.max(0, idx - 500), idx + 2500));
}
