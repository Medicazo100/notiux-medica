const fs = require('fs');

const liveCode = fs.readFileSync('itaca-assets/LiveSessionButton-B6m-V596.js', 'utf8');

let idx = 0;
while ((idx = liveCode.indexOf('Finalizar', idx)) !== -1) {
  console.log('Finalizar at', idx);
  console.log(liveCode.substring(idx - 100, idx + 300));
  console.log('---');
  idx += 9;
}
