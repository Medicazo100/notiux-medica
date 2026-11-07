const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const jtIdx = code.indexOf('function Jt');
console.log(code.substring(jtIdx - 800, jtIdx + 200));
