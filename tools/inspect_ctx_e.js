const fs = require('fs');
const content = fs.readFileSync('itaca-assets/AccountContext-_7AQjCqp.js', 'utf8');

const idx = content.indexOf('var E=');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 200));
} else {
  const idx2 = content.indexOf('E=');
  console.log(content.slice(Math.max(0, idx2 - 50), idx2 + 200));
}
