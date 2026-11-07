const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('query.placeholder') || content.includes('pregunta clínica')) {
    console.log(`Found query placeholder in: ${f}`);
    let pos = 0;
    while ((pos = content.indexOf('placeholder', pos)) !== -1) {
      console.log(content.slice(Math.max(0, pos - 40), pos + 100));
      pos += 12;
    }
  }
});
