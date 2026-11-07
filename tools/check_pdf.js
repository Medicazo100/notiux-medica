const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

const yoIdx = code.indexOf('async function Yo');
console.log(code.substring(yoIdx, yoIdx + 1500));
