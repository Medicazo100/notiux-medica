const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'Patients-DO9atCaJ.js');
const content = fs.readFileSync(file, 'utf8');

console.log(content.slice(2500, 3100));
