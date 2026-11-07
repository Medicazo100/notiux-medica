const fs = require('fs');
const content = fs.readFileSync('itaca-assets/index-Ctl6RXvm.js', 'utf8');

// search for Inicio
let pos = 0;
while ((pos = content.indexOf('nav.home', pos)) !== -1) {
  console.log(content.slice(Math.max(0, pos - 80), pos + 150));
  pos += 8;
}
