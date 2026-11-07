const { execSync } = require('child_process');
const dom = execSync('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --virtual-time-budget=3000 --dump-dom "http://localhost:3000/?source=pwa"', { maxBuffer: 10 * 1024 * 1024 }).toString();

const asideEnd = dom.indexOf('</aside>');
if (asideEnd !== -1) {
  console.log('After </aside>:');
  console.log(dom.slice(asideEnd, asideEnd + 4000));
}
