const fs = require('fs');
const content = fs.readFileSync('itaca-assets/videoMeetingPromptNavigation-XLt-_KQS.js', 'utf8');

const matches = content.match(/\/sessions[a-zA-Z0-9_\-\/]*/g) || [];
console.log('Sessions routes in videoMeetingPromptNavigation:', matches);
