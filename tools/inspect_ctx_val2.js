const fs = require('fs');
const content = fs.readFileSync('itaca-assets/AccountContext-_7AQjCqp.js', 'utf8');

const idx = content.indexOf('!D.has(r)');
console.log(content.slice(Math.max(0, idx - 300), idx + 200));
