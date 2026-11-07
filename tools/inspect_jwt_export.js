const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'runtimeSnapshot-CsLeWZEg.js');
const content = fs.readFileSync(file, 'utf8');

// find export { ... as n }
const m = content.match(/([a-zA-Z0-9_$]+)\s+as\s+n/g);
console.log('Export as n:', m);
// print end of file
console.log(content.slice(-1500));
