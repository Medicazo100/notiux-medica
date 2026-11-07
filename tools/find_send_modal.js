const fs = require('fs');
const path = require('path');

const dir = 'itaca-assets';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const full = path.join(dir, file);
    const content = fs.readFileSync(full, 'utf8');
    if (content.includes('Enviar por WhatsApp')) {
      console.log('Found in', file);
      const pos = content.indexOf('Enviar por WhatsApp');
      console.log(content.substring(Math.max(0, pos - 300), Math.min(content.length, pos + 300)));
    }
  }
});
