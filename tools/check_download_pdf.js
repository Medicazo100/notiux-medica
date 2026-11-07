const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

function findOccurrences(term) {
  let idx = 0;
  console.log(`=== SEARCH: ${term} ===`);
  while ((idx = code.indexOf(term, idx)) !== -1) {
    console.log(`Found at ${idx}:`);
    console.log(code.substring(Math.max(0, idx - 150), Math.min(code.length, idx + 250)));
    console.log('---');
    idx += term.length;
  }
}

findOccurrences('prescription.pdf');
findOccurrences('diagnostic_order.pdf');
findOccurrences('method:`save`');
findOccurrences('method:"save"');
findOccurrences('saveAs');
findOccurrences('download');
