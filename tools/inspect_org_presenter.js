const fs = require('fs');
const content = fs.readFileSync('itaca-assets/OrganizationMemberPresenter-CJxJgLWI.js', 'utf8');
console.log(content.slice(0, 1500));
