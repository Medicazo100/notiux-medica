const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'Home-3HiaJ6xE.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('Qi,{paths:G');
console.log('Snippet around Qi invocation:');
console.log(content.slice(Math.max(0, idx - 1200), idx + 800));
