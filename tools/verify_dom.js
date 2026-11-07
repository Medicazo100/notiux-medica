const { execSync } = require('child_process');
try {
  const dom = execSync('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --dump-dom "http://localhost:3000/?source=pwa"', { maxBuffer: 10 * 1024 * 1024 }).toString();
  const rootIndex = dom.indexOf('id="root"');
  if (rootIndex !== -1) {
    console.log('Inside #root (first 2500 chars):');
    console.log(dom.slice(rootIndex, rootIndex + 2500));
  } else {
    console.log('No #root found');
  }
} catch (e) {
  console.error('Error running Chrome:', e.message);
}
