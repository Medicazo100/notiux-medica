const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'fetchPatient-CaQJ3EB1.js');
if (fs.existsSync(file)) {
  console.log('fetchPatient content:');
  console.log(fs.readFileSync(file, 'utf8'));
}
