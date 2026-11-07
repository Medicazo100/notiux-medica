const fs = require('fs');
const content = fs.readFileSync('itaca-assets/index-Ctl6RXvm.js', 'utf8');

// search for key:`1` or key: "1"
const matches = content.match(/key:`1`[^}]+}/g) || [];
console.log('Matches:', matches.slice(0, 10));
