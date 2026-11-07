const fs = require('fs');
const code = fs.readFileSync('itaca-assets/generateDocx-BVvrZcXE.js', 'utf8');

const pos = code.indexOf('URL.revokeObjectURL(u)');
console.log(code.substring(pos - 200, pos + 100));
