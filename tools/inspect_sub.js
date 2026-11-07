const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'getCurrentSubscription-CqdLb-s4.js');
if (fs.existsSync(file)) {
  console.log('getCurrentSubscription content:');
  console.log(fs.readFileSync(file, 'utf8'));
}
