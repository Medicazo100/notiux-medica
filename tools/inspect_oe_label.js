const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('oe=(0,Z.useMemo)(()=>ne?');
console.log('oe snippet:');
console.log(content.slice(idx, idx + 400));

// Also let's find ne=KT()
const idx2 = content.indexOf('ne=KT()');
console.log('ne definition snippet:');
console.log(content.slice(Math.max(0, idx2 - 400), idx2 + 400));
