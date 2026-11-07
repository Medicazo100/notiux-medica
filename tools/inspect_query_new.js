const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'QueryNew-BSPbfYb1.js');
if (fs.existsSync(file)) {
  console.log('QueryNew length:', fs.readFileSync(file, 'utf8').length);
  console.log(fs.readFileSync(file, 'utf8').slice(0, 1500));
}
