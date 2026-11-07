const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

const ntIdx = code.indexOf('Nt=class');
console.log(code.substring(ntIdx, ntIdx + 1200));
