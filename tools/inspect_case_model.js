const fs = require('fs');
const content = fs.readFileSync('itaca-assets/CaseTextModal-XMYAOfhT.js', 'utf8');

const idx = content.indexOf('isValid(');
if (idx !== -1) {
  console.log(content.slice(Math.max(0, idx - 200), idx + 400));
} else {
  console.log(content.slice(0, 1000));
}
