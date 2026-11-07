const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const heIdx = code.indexOf('Ut as h'); // export { ... Ut as h ... }
console.log('Export Ut as h:', heIdx);
const utIdx = code.indexOf('function Ut');
console.log(code.substring(utIdx, utIdx + 1200));
