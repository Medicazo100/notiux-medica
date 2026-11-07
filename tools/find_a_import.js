const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const regex = /import\s*\{[^}]*A_[^}]*\}\s*from\s*["'][^"']+["']/g;
const m = content.match(regex);
console.log('A_ import match:', m);
