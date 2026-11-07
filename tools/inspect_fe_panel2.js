const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const lastExports = code.substring(code.length - 1000);
console.log(lastExports);
