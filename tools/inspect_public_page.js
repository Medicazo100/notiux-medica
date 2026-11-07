const fs = require('fs');
const content = fs.readFileSync('itaca-assets/PublicPage-EWPzMzM0.js', 'utf8');

console.log('Size:', content.length);
// Search for Button, Input, Switch
const matches = content.match(/<button|<input|aria-label/g) || [];
console.log('Matches:', matches);
