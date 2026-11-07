const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Sessions-1EuGS1t4.js', 'utf8');
console.log('Size:', content.length);
console.log(content.slice(0, 1500));
