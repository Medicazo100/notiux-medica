const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('cE(e)');
console.log('Snippet around cE:');
console.log(content.slice(Math.max(0, idx - 400), idx + 400));
