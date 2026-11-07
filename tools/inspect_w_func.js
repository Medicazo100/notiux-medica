const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'Home-3HiaJ6xE.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('W=(e,t)=>!r?.isClinic?.()');
console.log('Snippet around W:');
console.log(content.slice(Math.max(0, idx - 100), idx + 500));
