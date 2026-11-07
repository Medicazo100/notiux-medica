const fs = require('fs');
const code = fs.readFileSync('itaca-assets/NoteTypeSelector-DvMCRFvI.js', 'utf8');

const lastExports = code.substring(code.length - 400);
console.log(lastExports);
