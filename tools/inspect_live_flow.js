const fs = require('fs');
const code = fs.readFileSync('itaca-assets/LiveSessionButton-B6m-V596.js', 'utf8');

console.log(code.substring(19000, 21500));
