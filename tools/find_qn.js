const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const pos = code.indexOf('qn=({open');
if (pos === -1) {
  const p2 = code.indexOf('qn=');
  console.log('qn= at', p2);
  const p3 = code.lastIndexOf('qn=', code.indexOf('Enviar por WhatsApp'));
  console.log('last qn= before Enviar por WhatsApp at', p3);
  console.log(code.substring(p3, p3 + 600));
} else {
  console.log('qn=({open at', pos);
}
