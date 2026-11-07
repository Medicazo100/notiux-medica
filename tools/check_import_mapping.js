const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

const importIdx = code.indexOf('./PatientSelectorPanel-BG8a_yD3.js');
console.log(code.substring(importIdx - 200, importIdx + 50));
