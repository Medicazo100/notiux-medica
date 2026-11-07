const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'SessionPresenter-zGdpskhb.js');
const content = fs.readFileSync(file, 'utf8');

console.log(content.slice(0, 2500));
