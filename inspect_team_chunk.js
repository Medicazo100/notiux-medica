const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'Team-CUwyxT7E.js');
const content = fs.readFileSync(file, 'utf8');

console.log('Team size:', content.length);

// Look for API calls like L(`/...`) or hr(`/...`) or fetch
const endpoints = new Set();
const regex = /[`'"](\/[a-z_0-9]+(?:\/[a-z_0-9]+)*)[`'"]/g;
let m;
while ((m = regex.exec(content)) !== null) {
  if (m[1].length < 40 && !m[1].endsWith('.js') && !m[1].endsWith('.css')) {
    endpoints.add(m[1]);
  }
}
console.log('Endpoints in Team chunk:', Array.from(endpoints));
