const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Team-CUwyxT7E.js', 'utf8');

const idx = content.lastIndexOf('at=');
console.log(content.slice(Math.max(0, idx - 100), idx + 800));
