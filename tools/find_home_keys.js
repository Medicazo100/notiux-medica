const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const matches = content.match(/["'`]home\.[a-zA-Z0-9_\.]+["'`]/g);
  if (matches) {
    console.log(`${f} has ${matches.length} home.* matches:`, Array.from(new Set(matches)).slice(0, 10));
  }
});
