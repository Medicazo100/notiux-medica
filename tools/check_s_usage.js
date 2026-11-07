const fs = require('fs');
const code = fs.readFileSync('itaca-assets/generatePDF-Isauv6aA.js', 'utf8');

let idx = 0;
while ((idx = code.indexOf('S(', idx)) !== -1) {
  console.log(code.substring(Math.max(0, idx - 50), Math.min(code.length, idx + 100)));
  idx += 2;
}
