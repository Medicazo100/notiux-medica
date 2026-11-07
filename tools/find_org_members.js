const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('organization_members')) {
    console.log(`organization_members found in: ${f}`);
    let pos = 0;
    while ((pos = content.indexOf('organization_members', pos)) !== -1) {
      console.log(content.slice(Math.max(0, pos - 80), pos + 150));
      console.log('---');
      pos += 20;
    }
  }
});
