const fs = require('fs');
const path = require('path');

const dir = 'itaca-assets';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const full = path.join(dir, file);
    const content = fs.readFileSync(full, 'utf8');
    if (content.includes('createObjectURL')) {
      console.log('Found createObjectURL in', file);
      let idx = 0;
      while ((idx = content.indexOf('createObjectURL', idx)) !== -1) {
        console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
        console.log('---');
        idx += 15;
      }
    }
  }
});
