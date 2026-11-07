const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Calls-CsW1n2cW.js', 'utf8');
console.log('Size:', content.length);
console.log(content.slice(0, 1500));
