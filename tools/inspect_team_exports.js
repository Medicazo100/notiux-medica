const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Team-CUwyxT7E.js', 'utf8');

const matches = content.match(/useQuery|useEffect|fetch|useState/g) || [];
console.log('Matches:', matches);

// Find export default
const idx = content.lastIndexOf('export{');
console.log(content.slice(idx));
