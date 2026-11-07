const { execSync } = require('child_process');
try {
  const dom = execSync('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --dump-dom "http://localhost:3000/?source=pwa"', { maxBuffer: 10 * 1024 * 1024 }).toString();
  const mainIndex = dom.indexOf('home-page');
  if (mainIndex !== -1) {
    console.log('Main home-page (first 2500 chars):');
    console.log(dom.slice(mainIndex, mainIndex + 2500));
  } else {
    console.log('home-page not found in DOM, searching for "¿Por dónde quiere empezar?"');
    const startIdx = dom.indexOf('¿Por dónde quiere empezar?');
    if (startIdx !== -1) {
      console.log(dom.slice(startIdx - 100, startIdx + 800));
    } else {
      console.log('Not found yet. Checking what is rendered in main layout...');
      const layoutContentIdx = dom.indexOf('ant-layout-content');
      console.log(dom.slice(layoutContentIdx, layoutContentIdx + 2500));
    }
  }
} catch (e) {
  console.error('Error:', e.message);
}
