const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

const itIdx = code.indexOf('It=async');
console.log(code.substring(itIdx, itIdx + 800));
