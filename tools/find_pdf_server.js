const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.toLowerCase().includes('pdf') || l.toLowerCase().includes('download')) {
    console.log((idx+1) + ': ' + l.slice(0, 100));
  }
});
