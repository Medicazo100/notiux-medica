const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const anIdx = code.indexOf('an=');
console.log('an= found at', anIdx);
console.log(code.substring(anIdx, anIdx + 2500));
