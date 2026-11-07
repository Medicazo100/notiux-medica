const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

let idx = 0;
while ((idx = code.indexOf('packageOptions', idx)) !== -1) {
  console.log('packageOptions at', idx, code.substring(idx - 100, idx + 200));
  idx += 14;
}
