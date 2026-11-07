const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const idx = code.indexOf('capabilities: {');
console.log(code.slice(idx, idx + 800));
