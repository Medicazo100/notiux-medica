const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('U.map(e=>({key:e.key,icon:e.icon');
// search for U= or var U= or let U=
const sub = content.slice(Math.max(0, idx - 4000), idx);
const match = sub.match(/([a-zA-Z0-9_$]+)\s*=\s*(?:\[|\(0,\s*Z\.useMemo\)\(\s*\(\)\s*=>\s*BE\(\[)/);
console.log('Match for U array definition:');
console.log(match ? match[0] : 'not found');
// print 1500 chars before q=
const qIdx = sub.indexOf('q=(0,Z.useMemo)');
if (qIdx !== -1) {
  console.log('Before q:');
  console.log(sub.slice(Math.max(0, qIdx - 1500), qIdx));
}
