const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'Patients-DO9atCaJ.js');
const content = fs.readFileSync(file, 'utf8');

console.log('Patients file size:', content.length);
// Search for /patients
let pos = 0;
while ((pos = content.indexOf('/patients', pos)) !== -1) {
  console.log('Match at pos:', pos);
  console.log(content.slice(Math.max(0, pos - 100), pos + 250));
  console.log('---');
  pos += 9;
}
