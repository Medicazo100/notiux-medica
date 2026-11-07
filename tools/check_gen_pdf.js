const fs = require('fs');
const code = fs.readFileSync('itaca-assets/generatePDF-Isauv6aA.js', 'utf8');

console.log('generatePDF-Isauv6aA.js:');
let idx = 0;
while ((idx = code.indexOf('saveGeneratedPdf', idx)) !== -1) {
  console.log(code.substring(Math.max(0, idx - 50), Math.min(code.length, idx + 100)));
  idx += 16;
}

idx = 0;
while ((idx = code.indexOf('downloadExportFile', idx)) !== -1) {
  console.log(code.substring(Math.max(0, idx - 50), Math.min(code.length, idx + 100)));
  idx += 18;
}
