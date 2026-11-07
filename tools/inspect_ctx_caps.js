const fs = require('fs');
const content = fs.readFileSync('itaca-assets/AccountContext-_7AQjCqp.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('capabilities', pos)) !== -1) {
  console.log(content.slice(Math.max(0, pos - 50), pos + 100));
  pos += 12;
}
