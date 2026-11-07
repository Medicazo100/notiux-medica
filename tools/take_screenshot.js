const { execSync } = require('child_process');
const path = require('path');
const out = path.join(__dirname, 'clone_rendered.png');
try {
  execSync(`"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --window-size=1920,1080 --virtual-time-budget=4000 --screenshot="${out}" "http://localhost:3000/?source=pwa"`);
  console.log('Saved screenshot to:', out);
} catch (e) {
  console.error('Error:', e.message);
}
