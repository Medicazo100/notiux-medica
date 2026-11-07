const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'itaca-assets', 'authRequest-C5hHUNbV.js');
const content = fs.readFileSync(file, 'utf8');
console.log('Total length:', content.length);
// print lines after the vite mapDeps
const withoutDeps = content.replace(/const __vite__mapDeps=[\s\S]*?;\s*/, '');
console.log('After deps (first 2500 chars):');
console.log(withoutDeps.slice(0, 2500));
