const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('selectedKeys:[re],items:J');
console.log('Snippet (-3500 to -1500):');
console.log(content.slice(Math.max(0, idx - 3500), idx - 1500));
