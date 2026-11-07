const fs = require('fs');
const content = fs.readFileSync('itaca-assets/CaseTextModal-XMYAOfhT.js', 'utf8');

const idx = content.indexOf('var y=class');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 400));
} else {
  const idx2 = content.indexOf('class y');
  console.log(content.slice(idx2, idx2 + 400));
}
