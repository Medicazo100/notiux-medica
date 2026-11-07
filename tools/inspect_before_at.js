const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Team-CUwyxT7E.js', 'utf8');

const idx = content.indexOf('function at()');
console.log(content.slice(Math.max(0, idx - 1200), idx));
