const fs = require('fs');
const content = fs.readFileSync('itaca-assets/AccountContext-_7AQjCqp.js', 'utf8');

const idx = content.indexOf('can_manage_subscription');
console.log(content.slice(Math.max(0, idx - 250), idx + 250));
