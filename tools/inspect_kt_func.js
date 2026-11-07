const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('function KT(');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 600));
} else {
  const m = content.match(/KT\s*=\s*/);
  if (m) {
    const idx2 = content.indexOf(m[0]);
    console.log(content.slice(idx2, idx2 + 600));
  }
}
