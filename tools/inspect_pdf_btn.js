const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

const pos = code.indexOf('download-pdf-button');
console.log(code.substring(pos - 600, pos + 400));
