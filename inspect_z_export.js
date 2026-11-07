const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const regex = /([a-zA-Z0-9_$]+)\s+as\s+z\b/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('Export as z:', m[0], 'internal name:', m[1]);
  const name = m[1];
  const idx = content.indexOf(`var ${name}=`) !== -1 ? content.indexOf(`var ${name}=`) : content.indexOf(`${name}=async`);
  console.log(content.slice(Math.max(0, idx - 50), idx + 350));
}
