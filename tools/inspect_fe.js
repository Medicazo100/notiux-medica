const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

const feIdx = code.indexOf('fe=');
console.log('fe= found at', feIdx);
console.log(code.substring(feIdx, feIdx + 2000));
