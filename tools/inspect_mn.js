const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

const idx = code.indexOf('function Mn');
console.log('function Mn at', idx, code.substring(idx, idx + 1000));
