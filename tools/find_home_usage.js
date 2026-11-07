const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('visit_actions') || content.includes('greeting.day') || content.includes('home.start')) {
    console.log(`Found in ${f}`);
  }
});
