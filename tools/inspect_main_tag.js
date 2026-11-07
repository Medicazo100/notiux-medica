const { execSync } = require('child_process');
const dom = execSync('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --dump-dom "http://localhost:3000/?source=pwa"', { maxBuffer: 10 * 1024 * 1024 }).toString();

const mainTag = '<main class="ant-layout-content';
const idx = dom.indexOf(mainTag);
if (idx !== -1) {
  console.log('Main element contents:');
  console.log(dom.slice(idx, idx + 4000));
} else {
  console.log('No main element found');
}
