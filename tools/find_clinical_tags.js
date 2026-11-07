const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('/sessions/clinical_tags') || content.includes('clinical_tags')) {
    console.log(`clinical_tags found in: ${f}`);
    let pos = 0;
    while ((pos = content.indexOf('clinical_tags', pos)) !== -1) {
      console.log(content.slice(Math.max(0, pos - 50), pos + 100));
      pos += 15;
    }
  }
});
