const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'fetchQuery-cSjLkhYn.js');
if (fs.existsSync(file)) {
  console.log('fetchQuery content:');
  console.log(fs.readFileSync(file, 'utf8'));
}
