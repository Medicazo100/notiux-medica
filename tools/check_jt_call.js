const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const qtIdx = code.indexOf('function Qt');
const onIdx = code.indexOf('function on');

console.log('=== END OF Qt ===');
console.log(code.substring(qtIdx + 900, qtIdx + 1600));

console.log('=== END OF on ===');
console.log(code.substring(onIdx + 900, onIdx + 1600));
