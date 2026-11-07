const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'Team-CUwyxT7E.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('useEffect)(()=>{k()');
console.log('Before k():');
console.log(content.slice(Math.max(0, idx - 600), idx + 200));
