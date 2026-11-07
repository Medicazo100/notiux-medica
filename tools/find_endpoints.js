const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const apiMatches = new Set();
const apiRegex = /["'](\/(?:api|v[0-9]|auth|sessions|patients|notes|organizations|documents|cases|calls)[^"']*)["']/g;
const fetchRegex = /fetch\(\s*[`"']([^`"']+)`?["']/g;
const axiosRegex = /(?:post|get|put|delete|patch)\(\s*[`"']([^`"']+)`?["']/g;

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  let m;
  while ((m = apiRegex.exec(content)) !== null) {
    if (m[1].length < 80 && !m[1].includes('<') && !m[1].includes('{')) {
      apiMatches.add(m[1]);
    }
  }
  while ((m = fetchRegex.exec(content)) !== null) {
    if (m[1].length < 80) apiMatches.add('FETCH: ' + m[1]);
  }
});

console.log('API / Endpoint candidates found:');
console.log(Array.from(apiMatches).sort());
