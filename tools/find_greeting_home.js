const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'Home-3HiaJ6xE.js');
const content = fs.readFileSync(file, 'utf8');

let pos = 0;
while ((pos = content.indexOf('greeting', pos)) !== -1) {
  console.log('Snippet at pos:', pos);
  console.log(content.slice(Math.max(0, pos - 100), pos + 300));
  console.log('---');
  pos += 8;
}
