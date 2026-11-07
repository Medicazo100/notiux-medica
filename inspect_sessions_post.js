const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes("`/sessions`") || content.includes("'/sessions'")) {
    const idx = content.indexOf('/sessions');
    console.log(`Found in ${f}:`);
    console.log(content.slice(Math.max(0, idx - 100), idx + 300));
  }
});
