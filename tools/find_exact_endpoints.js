const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const endpoints = new Set();
const regex = /["'](\/(?:note_templates|patients|sessions|cases|queries|documents|calls|audio|users|account|user_settings|organizations|surveys|features)[^"']*)["']/g;

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  let m;
  while ((m = regex.exec(content)) !== null) {
    if (!m[1].includes('<') && !m[1].includes('${') && m[1].length < 80) {
      endpoints.add(m[1]);
    }
  }
});

console.log('Discovered exact API endpoints in frontend:');
console.log(Array.from(endpoints).sort());
