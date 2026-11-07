const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('function cE(');
if (idx !== -1) {
  console.log('function cE:');
  console.log(content.slice(idx, idx + 400));
} else {
  const m = content.match(/cE\s*=\s*/);
  if (m) {
    const idx2 = content.indexOf(m[0]);
    console.log(content.slice(idx2, idx2 + 400));
  }
}
const m2 = content.match(/A_\s*=\s*/);
if (m2) {
  const idx3 = content.indexOf(m2[0]);
  console.log('A_ definition:');
  console.log(content.slice(idx3, idx3 + 400));
}
