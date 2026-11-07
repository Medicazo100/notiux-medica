const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('start.tabs') || content.includes('start.title') || content.includes('products.sessions')) {
    console.log(`Found reference in ${f}`);
  }
});
