const fs = require('fs');
const content = fs.readFileSync('itaca-assets/QueryForm-CiE4tJGW.js', 'utf8');

const idx = content.indexOf('TextArea');
if (idx !== -1) {
  console.log(content.slice(Math.max(0, idx - 100), idx + 400));
} else {
  console.log(content.slice(1500, 3000));
}
