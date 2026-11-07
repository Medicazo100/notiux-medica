const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf(`path:'/users'`);
const idx2 = content.indexOf(`path:"/users"`);
const idx3 = content.indexOf(`path:\`/users\``);

console.log('Indices:', idx, idx2, idx3);
const found = [idx, idx2, idx3].filter(x => x !== -1)[0];
if (found) {
  console.log(content.slice(Math.max(0, found - 200), found + 400));
}
