const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const imports = code.substring(0, 3000);
console.log('Imports with Qe:');
let idx = 0;
while ((idx = imports.indexOf('Qe', idx)) !== -1) {
  console.log(imports.substring(Math.max(0, idx - 50), Math.min(imports.length, idx + 50)));
  idx += 2;
}
