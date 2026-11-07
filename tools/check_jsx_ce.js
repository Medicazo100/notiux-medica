const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

let idx = 0;
while ((idx = code.indexOf('Ce', idx)) !== -1) {
  if (code.substring(idx - 5, idx + 10).includes('(0,q.jsx)(Ce')) {
    console.log('Found jsx(Ce) at', idx);
    console.log(code.substring(idx - 200, idx + 500));
  }
  idx += 2;
}
