const fs = require('fs');
const content = fs.readFileSync('itaca-assets/QueryForm-CiE4tJGW.js', 'utf8');
console.log('QueryForm size:', content.length);
console.log(content.slice(0, 1500));
