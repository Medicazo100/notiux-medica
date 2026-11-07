const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

function showFunc(name) {
  let idx = code.indexOf(`function ${name}`);
  if (idx !== -1) {
    console.log(`=== function ${name} ===`);
    console.log(code.substring(idx, idx + 1500));
  } else {
    idx = code.indexOf(`${name}=`);
    console.log(`=== ${name}= ===`);
    console.log(code.substring(idx, idx + 1500));
  }
}

showFunc('Qt');
showFunc('on');
