const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

const idx = code.indexOf('Nn=');
if (idx !== -1) {
  console.log('Nn= at', idx, code.substring(idx, idx + 1000));
} else {
  const idx2 = code.indexOf('function Nn');
  console.log('function Nn at', idx2, code.substring(idx2, idx2 + 1000));
}
