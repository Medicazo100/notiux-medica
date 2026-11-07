const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

console.log(code.substring(121000, 122500));
