const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const exportIdx = code.indexOf('f as fe');
console.log('Export of fe:', code.substring(exportIdx - 50, exportIdx + 100));

// Find what is exported as fe
// e.g. an as fe or something
