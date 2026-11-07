const fs = require('fs');
const content = fs.readFileSync('itaca-assets/CallList-BJnBIfvY.js', 'utf8');

const idx = content.lastIndexOf('export{');
console.log('Exports in CallList:', content.slice(idx));

const idxP = content.indexOf('var p=');
if (idxP !== -1) {
  console.log(content.slice(idxP, idxP + 600));
} else {
  console.log(content.slice(0, 1000));
}
