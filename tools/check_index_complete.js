const fs = require('fs');
const code = fs.readFileSync('itaca-assets/index-Ctl6RXvm.js', 'utf8');

const pos = code.indexOf('/complete');
console.log('Index of /complete in index:', pos);
if (pos !== -1) {
  console.log(code.substring(pos - 200, pos + 400));
}

let idx = 0;
while ((idx = code.indexOf('complete_audio_upload', idx)) !== -1) {
  console.log('complete_audio_upload at', idx);
  console.log(code.substring(idx - 100, idx + 200));
  idx += 21;
}

idx = 0;
while ((idx = code.indexOf('/sessions/', idx)) !== -1) {
  console.log('Found /sessions/ at', idx, code.substring(idx, idx + 100));
  idx += 10;
}
