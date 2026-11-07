const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'Home-3HiaJ6xE.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('paths:G,voice:oe');
console.log('Snippet (-800 to +300):');
console.log(content.slice(Math.max(0, idx - 800), idx + 300));
