const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const pos = code.indexOf('Enviar por WhatsApp');
console.log(code.substring(pos - 1600, pos - 1000));
