const fs = require('fs');
const code = fs.readFileSync('itaca-assets/authRequest-C5hHUNbV.js', 'utf8');
console.log(code.substring(code.length - 1200));
