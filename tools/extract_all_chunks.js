const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

const match = content.match(/m\.f=\[([^\]]+)\]/);
if (match) {
  const deps = JSON.parse('[' + match[1] + ']');
  console.log('Total __vite__mapDeps chunks in index:', deps.length);
  fs.writeFileSync('all_vite_deps.json', JSON.stringify(deps, null, 2));
  console.log('Sample chunk names:');
  console.log(deps.filter(d => !d.includes('Outlined') && !d.includes('runtime') && !d.includes('lib-')).slice(0, 50));
} else {
  console.log('No m.f=[...] match found');
}
