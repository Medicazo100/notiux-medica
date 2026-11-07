const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Cases-BX6g0v_v.js', 'utf8');

console.log(content.slice(0, 1500));
