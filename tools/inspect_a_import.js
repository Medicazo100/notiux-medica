const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('!A_(e,s)');
console.log('Snippet around !A_(e,s):');
console.log(content.slice(Math.max(0, idx - 150), idx + 150));
