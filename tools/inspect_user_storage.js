const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'userStorage-B_Vz9E7X.js');
const content = fs.readFileSync(file, 'utf8');

console.log('userStorage length:', content.length);
console.log(content.slice(0, 3000));
