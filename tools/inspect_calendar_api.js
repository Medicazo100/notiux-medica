const fs = require('fs');
const path = require('path');

['connectCalendar-nn6W95RD.js', 'retryUploadWorker-D7pZtyXA.js'].forEach(fname => {
  const file = path.join(__dirname, 'itaca-assets', fname);
  const content = fs.readFileSync(file, 'utf8');
  let pos = 0;
  console.log(`=== ${fname} ===`);
  while ((pos = content.indexOf('https://api.itaca.pro', pos)) !== -1) {
    console.log(content.slice(Math.max(0, pos - 50), pos + 100));
    pos += 21;
  }
});
