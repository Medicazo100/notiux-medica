const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('source=pwa') || content.includes('pwa')) {
    console.log(`Found pwa in ${f}`);
    let pos = 0;
    while ((pos = content.indexOf('source=pwa', pos)) !== -1) {
      console.log(content.slice(Math.max(0, pos - 100), pos + 100));
      pos += 10;
    }
  }
});
