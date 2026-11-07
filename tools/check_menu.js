const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientLinkModal-Cd4QoOou.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = code.indexOf('diagnostic_order', idx)) !== -1) {
  console.log('Match at', idx, code.substring(idx - 50, idx + 200));
  idx += 16;
}
