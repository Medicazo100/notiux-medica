const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'Home-3HiaJ6xE.js');
const content = fs.readFileSync(file, 'utf8');

console.log('Home-3HiaJ6xE.js length:', content.length);
console.log(content.slice(0, 3000));
