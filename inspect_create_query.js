const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'createQuery-DKX4uDab.js');
if (fs.existsSync(file)) {
  console.log('createQuery content:');
  console.log(fs.readFileSync(file, 'utf8'));
}
