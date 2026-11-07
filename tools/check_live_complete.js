const fs = require('fs');
const code = fs.readFileSync('itaca-assets/LiveSessionButton-B6m-V596.js', 'utf8');

function findTerms(term) {
  let idx = 0;
  console.log(`=== SEARCH: ${term} ===`);
  while ((idx = code.indexOf(term, idx)) !== -1) {
    console.log(`Found at ${idx}:`);
    console.log(code.substring(Math.max(0, idx - 100), Math.min(code.length, idx + 250)));
    console.log('---');
    idx += term.length;
  }
}

findTerms('/complete');
findTerms('complete');
findTerms('create_note');
findTerms('Finalizar');
