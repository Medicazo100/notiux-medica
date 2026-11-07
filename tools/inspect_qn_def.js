const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const pos = code.indexOf('qn=');
console.log(code.substring(pos, pos + 1000));
