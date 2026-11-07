const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'updateSession-C6tddkXq.js');
if (fs.existsSync(file)) {
  console.log('updateSession content:');
  console.log(fs.readFileSync(file, 'utf8'));
}
