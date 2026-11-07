const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'Team-CUwyxT7E.js');
const content = fs.readFileSync(file, 'utf8');

console.log(content.slice(1400, 2800));
