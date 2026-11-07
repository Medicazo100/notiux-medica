const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'userStorage-B_Vz9E7X.js');
const content = fs.readFileSync(file, 'utf8');

console.log('Last 4000 chars of userStorage:');
console.log(content.slice(-4000));
