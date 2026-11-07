const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Team-CUwyxT7E.js', 'utf8');

const idx = content.indexOf('var Re=');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 800));
} else {
  const idx2 = content.indexOf('Re=');
  console.log(content.slice(Math.max(0, idx2 - 50), idx2 + 800));
}
