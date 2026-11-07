const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Team-CUwyxT7E.js', 'utf8');

const matches = content.match(/[a-zA-Z0-9_$]+\s*=\s*\([^)]*\)\s*=>/g) || [];
console.log('Matches:', matches.slice(0, 20));

const idx = content.lastIndexOf('Re=');
console.log(content.slice(idx - 100, idx + 400));
