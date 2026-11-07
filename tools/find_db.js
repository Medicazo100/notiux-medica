const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('db =') || l.includes('let db') || l.includes('const db')) {
    console.log((idx+1) + ': ' + l.slice(0, 100));
  }
});
