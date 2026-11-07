const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

console.log('=== Pt function ===');
console.log(code.substring(33000, 33500));
