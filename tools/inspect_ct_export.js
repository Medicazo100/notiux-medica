const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'errorHandling-BGzTg7xQ.js');
const content = fs.readFileSync(file, 'utf8');

// find export { ... as Ct ... }
const regex = /([a-zA-Z0-9_$]+)\s+as\s+Ct/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log('Match:', match[0], 'internal name:', match[1]);
  // find definition of internal name
  const name = match[1];
  const idx = content.lastIndexOf(name + '=', content.indexOf(match[0]));
  if (idx !== -1) {
    console.log('Definition:', content.slice(idx, idx + 200));
  } else {
    const idx2 = content.indexOf('function ' + name);
    if (idx2 !== -1) {
      console.log('Function definition:', content.slice(idx2, idx2 + 200));
    }
  }
}
