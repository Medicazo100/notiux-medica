const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

let pos = 0;
while ((pos = content.indexOf('pwa', pos)) !== -1) {
  console.log('Pos in index.html:', pos);
  console.log(content.slice(Math.max(0, pos - 50), pos + 100));
  pos += 4;
}
