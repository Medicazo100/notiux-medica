const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const onIdx = code.indexOf('function on');
console.log(code.substring(onIdx + 1500, onIdx + 2600));
