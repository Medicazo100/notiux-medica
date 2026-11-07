const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'QueryPresenter-DVYZmaSH.js');
if (fs.existsSync(file)) {
  console.log('QueryPresenter content:');
  console.log(fs.readFileSync(file, 'utf8').slice(0, 2500));
}
