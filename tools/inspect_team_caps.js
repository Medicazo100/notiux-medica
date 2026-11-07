const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Team-CUwyxT7E.js', 'utf8');

const matches = content.match(/can[A-Z][a-zA-Z0-9]+/g) || [];
console.log('Capabilities in Team:', Array.from(new Set(matches)));
