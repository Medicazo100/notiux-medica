const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'Home-3HiaJ6xE.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('function to(');
if (idx !== -1) {
  console.log('function to snippet:');
  console.log(content.slice(idx, idx + 800));
} else {
  // search var to = or const to =
  const m = content.match(/var\s+to\s*=|const\s+to\s*=|let\s+to\s*=/);
  if (m) {
    const idx2 = content.indexOf(m[0]);
    console.log(content.slice(idx2, idx2 + 800));
  }
}
