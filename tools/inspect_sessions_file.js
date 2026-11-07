const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Sessions-1EuGS1t4.js', 'utf8');

// Search for all occurrences of /sessions or fetch calls
let pos = 0;
while ((pos = content.indexOf('/sessions', pos)) !== -1) {
  console.log('Pos:', pos);
  console.log(content.slice(Math.max(0, pos - 80), pos + 220));
  console.log('----------------');
  pos += 9;
}
