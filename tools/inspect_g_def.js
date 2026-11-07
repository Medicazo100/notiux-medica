const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'Home-3HiaJ6xE.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('K=!i&&!!s&&!te&&G.length>0');
console.log('Snippet (-1500 to 0):');
console.log(content.slice(Math.max(0, idx - 1500), idx));
