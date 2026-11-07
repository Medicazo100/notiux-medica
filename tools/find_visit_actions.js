const fs = require('fs');
const path = require('path');

['errorHandling-BGzTg7xQ.js', 'retryUploadWorker-D7pZtyXA.js'].forEach(fname => {
  const file = path.join(__dirname, 'itaca-assets', fname);
  const content = fs.readFileSync(file, 'utf8');
  let pos = 0;
  console.log(`=== Searching in ${fname} ===`);
  while ((pos = content.indexOf('visit_actions', pos)) !== -1) {
    console.log(`At index ${pos}:`);
    console.log(content.slice(Math.max(0, pos - 150), pos + 250));
    console.log('---');
    pos += 'visit_actions'.length;
  }
});
