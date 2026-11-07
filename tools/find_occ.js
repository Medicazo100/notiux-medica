const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  // Count occurrences of phrase
  const phrase = 'Con el paciente presente';
  let pos = 0, count = 0;
  while ((pos = content.indexOf(phrase, pos)) !== -1) {
    count++;
    pos += phrase.length;
  }
  if (count > 0) {
    console.log(`${f}: ${count} occurrences`);
  }
});
