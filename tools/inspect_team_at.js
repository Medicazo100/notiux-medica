const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Team-CUwyxT7E.js', 'utf8');

const idx = content.indexOf('var at=');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 800));
} else {
  const idx2 = content.indexOf('at=');
  console.log(content.slice(idx2, idx2 + 800));
}
