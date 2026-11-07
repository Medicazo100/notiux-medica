const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientDocumentDrawer-R5XAgYMc.js', 'utf8');

const matches = [];
let re = /\bfe\b/g;
let m;
// find where fe is assigned or imported
const topImports = code.substring(0, 3000);
console.log('Top imports:');
console.log(topImports);
