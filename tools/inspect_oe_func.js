const fs = require('fs');
const content = fs.readFileSync('itaca-assets/videoMeetingPromptNavigation-XLt-_KQS.js', 'utf8');

const idx = content.lastIndexOf('export{');
console.log(content.slice(idx));

// find definition of oe or whatever is exported
const exportLine = content.slice(idx);
console.log('Exports:', exportLine);
