const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const qeIdx = code.indexOf('function Qe');
if (qeIdx !== -1) {
  console.log('function Qe:', code.substring(qeIdx, qeIdx + 800));
} else {
  const qe2 = code.indexOf('Qe=');
  console.log('Qe=:', code.substring(qe2, qe2 + 800));
}
