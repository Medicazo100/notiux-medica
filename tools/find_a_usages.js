const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('A_(');
console.log('A_ invocations / definition:');
let pos = 0;
while ((pos = content.indexOf('A_', pos)) !== -1) {
  console.log(content.slice(Math.max(0, pos - 50), pos + 100));
  pos += 2;
}
