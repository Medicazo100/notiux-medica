const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'AccountContext-_7AQjCqp.js');
const content = fs.readFileSync(file, 'utf8');

// Find all occurrences of t. or e.data
const props = new Set();
const regex = /t\?\.([a-zA-Z0-9_]+)/g;
let m;
while ((m = regex.exec(content)) !== null) {
  props.add(m[1]);
}
console.log('Account properties accessed:', Array.from(props));
