const fs = require('fs');

for (const file of ['itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'itaca-assets/PatientDocumentDrawer-R5XAgYMc.js']) {
  if (fs.existsSync(file)) {
    const code = fs.readFileSync(file, 'utf8');
    const idx = code.indexOf('WhatsApp');
    if (idx !== -1) {
      console.log(`Found WhatsApp in ${file} at ${idx}:`);
      console.log(code.substring(idx - 150, idx + 400));
    }
  }
}
