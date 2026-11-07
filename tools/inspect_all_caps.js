const fs = require('fs');
const content = fs.readFileSync('itaca-assets/AccountContext-_7AQjCqp.js', 'utf8');

const matches = content.match(/hasCapability\(`([^`]+)`\)/g) || [];
console.log('Account capabilities:', Array.from(new Set(matches.map(m => m.slice(15, -2)))));
