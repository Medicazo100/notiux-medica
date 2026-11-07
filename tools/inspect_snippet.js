const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'retryUploadWorker-D7pZtyXA.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('¿Por dónde quiere empezar?');
console.log('Found at index:', idx);
if (idx !== -1) {
  console.log('Snippet (-200 to +1500 chars):');
  console.log(content.slice(Math.max(0, idx - 200), idx + 2500));
}
