const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'Team-CUwyxT7E.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('/organization_invites');
console.log('organization_invites snippet:');
console.log(content.slice(Math.max(0, idx - 100), idx + 400));
