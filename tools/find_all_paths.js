const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const endpoints = new Set();
// match any `/...` string that looks like an endpoint
const regex = /[`'"](\/[a-z_0-9]+(?:\/[a-z_0-9]+)*)[`'"]/g;

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  let m;
  while ((m = regex.exec(content)) !== null) {
    const s = m[1];
    if (
      !s.startsWith('/itaca-assets') &&
      !s.endsWith('.js') &&
      !s.endsWith('.css') &&
      !s.endsWith('.png') &&
      !s.endsWith('.svg') &&
      !s.endsWith('.ico') &&
      s.length > 2 &&
      s.length < 50
    ) {
      endpoints.add(s);
    }
  }
});

console.log('Unique potential API/Route paths in bundle:');
console.log(Array.from(endpoints).sort());
