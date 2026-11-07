const fs = require('fs');
const content = fs.readFileSync('itaca-assets/videoMeetingPromptNavigation-XLt-_KQS.js', 'utf8');

const idx = content.indexOf('var p=');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 800));
} else {
  const idx2 = content.indexOf('p=async');
  console.log(content.slice(idx2, idx2 + 800));
}
