const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

function search(term) {
  let idx = 0;
  console.log(`=== SEARCH: ${term} ===`);
  while ((idx = code.indexOf(term, idx)) !== -1) {
    console.log(`Found at ${idx}:`);
    console.log(code.substring(Math.max(0, idx - 100), Math.min(code.length, idx + 250)));
    console.log('-----------------------------');
    idx += term.length;
  }
}

search('order_package_uuids');
search('diagnostic_order');
