const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'errorHandling-BGzTg7xQ.js');
const content = fs.readFileSync(file, 'utf8');

// Find nav: { ... } in the translation object
const idx = content.indexOf('nav:{');
console.log('nav:{ index:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 1500));
}
