const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Team-CUwyxT7E.js', 'utf8');

// find all fetch / authRequest calls
const matches = content.match(/([a-zA-Z0-9_$]+)\((`\/[^`]+`|'\/[^']+'|\"\/[^\"]+\")/g) || [];
console.log('Calls in Team:', matches);

// find imports from authRequest
const idx = content.indexOf('authRequest');
console.log(content.slice(Math.max(0, idx - 100), idx + 200));
