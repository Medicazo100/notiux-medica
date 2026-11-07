const fs = require('fs');
const content = fs.readFileSync('itaca-assets/CaseTextModal-XMYAOfhT.js', 'utf8');

const idx = content.indexOf('getLatestTextEntry(){');
console.log(content.slice(idx, idx + 400));
