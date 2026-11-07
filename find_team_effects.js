const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'Team-CUwyxT7E.js');
const content = fs.readFileSync(file, 'utf8');

// find all useEffect
let pos = 0;
while ((pos = content.indexOf('useEffect', pos)) !== -1) {
  console.log('useEffect at pos:', pos);
  console.log(content.slice(pos, pos + 300));
  console.log('---');
  pos += 9;
}
