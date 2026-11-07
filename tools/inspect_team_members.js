const fs = require('fs');
const content = fs.readFileSync('itaca-assets/Team-CUwyxT7E.js', 'utf8');

// find where organization_members or organization_invites are rendered
let pos = 0;
while ((pos = content.indexOf('organization_members', pos)) !== -1) {
  console.log(content.slice(Math.max(0, pos - 50), pos + 120));
  pos += 20;
}
