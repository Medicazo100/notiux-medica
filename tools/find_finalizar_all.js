const fs = require('fs');
const path = require('path');

const dir = 'itaca-assets';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (content.includes('Finalizar y generar nota') || content.includes('Finalizar')) {
      console.log('Match in', file);
      let idx = 0;
      while ((idx = content.indexOf('Finalizar', idx)) !== -1) {
        console.log(content.substring(Math.max(0, idx - 50), Math.min(content.length, idx + 100)));
        idx += 9;
      }
    }
  }
});
