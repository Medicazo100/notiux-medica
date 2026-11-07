const fs = require('fs');
const content = fs.readFileSync('itaca-assets/index-Ctl6RXvm.js', 'utf8');

const idx = content.indexOf('Fetching organization members failed');
console.log(content.slice(Math.max(0, idx - 200), idx + 200));
