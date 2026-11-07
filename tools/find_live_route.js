const fs = require('fs');
const path = require('path');

const dir = 'itaca-assets';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (content.includes('"/live"') || content.includes('`/live`') || content.includes("'/live'")) {
      console.log('Match in', file);
    }
  }
});
