const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

console.log('index-Ctl6RXvm.js size:', content.length);

// Look for route paths like path: "/", path: "/patients", path: "/evidence", etc.
const routeMatches = content.match(/path:\s*["'][^"']+["']/g) || [];
console.log('Route path matches in index:', Array.from(new Set(routeMatches)));

// Look for dynamic imports inside index
const importMatches = content.match(/import\s*\(\s*["'][^"']+["']\s*\)/g) || [];
console.log('Dynamic import matches in index:', Array.from(new Set(importMatches)).slice(0, 30));
