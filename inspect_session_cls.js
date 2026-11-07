const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'SessionPresenter-zGdpskhb.js');
const content = fs.readFileSync(file, 'utf8');

// find export { ... as t }
const m = content.match(/([a-zA-Z0-9_$]+)\s+as\s+t/);
console.log('Export as t in SessionPresenter:', m);
if (m) {
  const clsName = m[1];
  const idx = content.indexOf(`class ${clsName}`);
  console.log('Class definition snippet:');
  console.log(content.slice(idx, idx + 1500));
}
