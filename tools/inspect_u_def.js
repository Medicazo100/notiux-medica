const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('U.map(e=>({key:e.key,icon:e.icon');
console.log('Snippet (-1200 to 0):');
console.log(content.slice(Math.max(0, idx - 1200), idx));
