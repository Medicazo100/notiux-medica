const fs = require('fs');

for (const file of ['itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'itaca-assets/PatientDocumentDrawer-R5XAgYMc.js']) {
  if (fs.existsSync(file)) {
    const code = fs.readFileSync(file, 'utf8');
    const idx = code.indexOf('Enviar receta médica');
    if (idx !== -1) {
      console.log(`Found in ${file} at ${idx}:`);
      console.log(code.substring(idx - 100, idx + 400));
    }
  }
}
