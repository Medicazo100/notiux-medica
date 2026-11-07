const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('app-side-navigation')) {
    console.log(`Found app-side-navigation in ${f}`);
    const idx = content.indexOf('app-side-navigation');
    console.log(content.slice(Math.max(0, idx - 400), idx + 800));
  }
});
