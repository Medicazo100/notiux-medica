const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'runtimeSnapshot-CsLeWZEg.js');
const content = fs.readFileSync(file, 'utf8');

// find jwtDecode
console.log('runtimeSnapshot snippet:');
console.log(content.slice(0, 2000));
