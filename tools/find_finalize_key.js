const fs = require('fs');
const path = require('path');

const dir = 'itaca-assets';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js') && file !== 'errorHandling-BGzTg7xQ.js' && file !== 'retryUploadWorker-D7pZtyXA.js') {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (content.includes('.finalize') || content.includes('finalize_short') || content.includes('finalize`') || content.includes('finalize"')) {
      console.log('Match in', file);
      let idx = 0;
      while ((idx = content.indexOf('finalize', idx)) !== -1) {
        console.log(content.substring(Math.max(0, idx - 80), Math.min(content.length, idx + 150)));
        idx += 8;
      }
    }
  }
});
