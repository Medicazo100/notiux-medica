const fs = require('fs');
const content = fs.readFileSync('itaca-assets/AccountContext-_7AQjCqp.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('isPractice', pos)) !== -1) {
  console.log(content.slice(Math.max(0, pos - 50), pos + 100));
  pos += 10;
}

pos = 0;
while ((pos = content.indexOf('isClinic', pos)) !== -1) {
  console.log(content.slice(Math.max(0, pos - 50), pos + 100));
  pos += 8;
}
