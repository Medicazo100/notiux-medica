const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /\/itaca-assets\/[^"' >]+/g;
const matches = Array.from(new Set(html.match(regex) || []));
console.log('Total asset matches in index.html:', matches.length);
console.log(JSON.stringify(matches, null, 2));
