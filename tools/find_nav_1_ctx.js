const fs = require('fs');
const content = fs.readFileSync('itaca-assets/index-Ctl6RXvm.js', 'utf8');

const idx = content.indexOf('key:`1`');
console.log(content.slice(Math.max(0, idx - 100), idx + 400));
