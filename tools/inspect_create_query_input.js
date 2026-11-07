const fs = require('fs');
const content = fs.readFileSync('itaca-assets/createQuery-DKX4uDab.js', 'utf8');

const matches = content.match(/<textarea|<input|TextArea/g) || [];
console.log('Matches in createQuery:', matches);

// Find where input is created
let pos = 0;
while ((pos = content.indexOf('placeholder', pos)) !== -1) {
  console.log(content.slice(Math.max(0, pos - 50), pos + 120));
  pos += 12;
}
