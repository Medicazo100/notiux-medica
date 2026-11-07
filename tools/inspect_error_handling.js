const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'errorHandling-BGzTg7xQ.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('Con el paciente presente');
console.log('Snippet (-400 to +1500 chars):');
console.log(content.slice(Math.max(0, idx - 400), idx + 2000));
