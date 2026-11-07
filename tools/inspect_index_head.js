const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

console.log('First 2000 chars:');
console.log(content.slice(0, 2000));
