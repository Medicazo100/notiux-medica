const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const authFile = path.join(dir, 'authRequest-C5hHUNbV.js');
if (fs.existsSync(authFile)) {
  console.log('authRequest contents (first 2000 chars):');
  console.log(fs.readFileSync(authFile, 'utf8').slice(0, 2000));
}
