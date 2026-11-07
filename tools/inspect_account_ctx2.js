const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'AccountContext-_7AQjCqp.js');
const content = fs.readFileSync(file, 'utf8');

console.log(content.slice(1500, 4500));
