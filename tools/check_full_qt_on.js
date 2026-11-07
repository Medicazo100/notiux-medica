const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const qtIdx = code.indexOf('function Qt');
const onIdx = code.indexOf('function on');

console.log('=== FULL Qt ===');
console.log(code.substring(qtIdx, code.indexOf('function on')));

console.log('=== FULL on ===');
console.log(code.substring(onIdx, onIdx + 2000));
