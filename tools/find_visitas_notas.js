const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'errorHandling-BGzTg7xQ.js');
const content = fs.readFileSync(file, 'utf8');

const target = 'Visitas y notas';
let pos = 0;
while ((pos = content.indexOf(target, pos)) !== -1) {
  console.log(`Found "${target}" at pos:`, pos);
  console.log(content.slice(Math.max(0, pos - 150), pos + 150));
  console.log('---');
  pos += target.length;
}
