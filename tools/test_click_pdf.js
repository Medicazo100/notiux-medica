const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const downloadDir = path.join(__dirname, 'test_downloads');
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

for (const file of fs.readdirSync(downloadDir)) {
  fs.unlinkSync(path.join(downloadDir, file));
}

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function testPdfClick() {
  console.log('[TEST] Starting Chrome...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1600,1000',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + path.join(__dirname, 'chrome-temp-qa')
  ]);
  await sleep(1500);

  try {
    const listRes = await fetch('http://localhost:9222/json/list');
    let pages = await listRes.json();
    let pageTarget = pages.find(p => p.type === 'page');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Browser.downloadWillBegin' || msg.method === 'Page.downloadWillBegin') {
        console.log('[DOWNLOAD WILL BEGIN]:', msg.params.suggestedFilename || msg.params.url);
      }
      if (msg.method === 'Browser.downloadProgress' || msg.method === 'Page.downloadProgress') {
        console.log('[DOWNLOAD PROGRESS]:', msg.params.state, msg.params.receivedBytes, '/', msg.params.totalBytes);
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    console.log('[TEST] Connected to Chrome DevTools Protocol!');

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
      eventsEnabled: true
    });

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
      return res.result?.value;
    }

    console.log('[TEST] Navigating to Raul Ortega...');
    await send('Page.navigate', { url: 'http://localhost:3000/patients/p-1793818446314#documents' });
    await sleep(2500);

    // Click Documentos dropdown
    await evaluate(`(() => { document.querySelectorAll('button').forEach(b => { if (b.innerText.includes('Documentos')) b.click(); }); })()`);
    await sleep(600);

    // Click Orden de estudios
    await evaluate(`(() => {
      const opt = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === 'Orden de estudios' && el.closest('.ant-dropdown-menu-item, li, button'));
      if (opt) (opt.closest('.ant-dropdown-menu-item, li, button') || opt).click();
    })()`);
    await sleep(1500);

    // Open package selector
    await evaluate(`(() => {
      const sel = document.querySelector('.diagnostic-order-modal .ant-select-selector');
      if (sel) { sel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); sel.click(); }
    })()`);
    await sleep(600);

    // Select Check-up general preventivo
    await evaluate(`(() => {
      const items = Array.from(document.querySelectorAll('.ant-select-item-option'));
      const opt = items.find(i => i.innerText.includes('Check-up general preventivo'));
      if (opt) { opt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); opt.click(); }
    })()`);
    await sleep(800);

    // Click Generar orden
    console.log('[TEST] Clicking Generar orden...');
    await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Generar orden'));
      if (btn) btn.click();
    })()`);
    await sleep(3500);

    // Now click the PDF download button in the drawer!
    console.log('[TEST] Finding and clicking PDF download button in drawer...');
    const clicked = await evaluate(`
      (() => {
        const btn = document.querySelector('[data-testid="download-pdf-button"]');
        if (btn) {
          btn.click();
          return 'clicked by testid';
        }
        const buttons = Array.from(document.querySelectorAll('button'));
        const pdfBtn = buttons.find(b => b.innerText.includes('PDF'));
        if (pdfBtn) {
          pdfBtn.click();
          return 'clicked by text';
        }
        return 'not found';
      })()
    `);
    console.log('[TEST] PDF button click result:', clicked);

    // Wait for PDF generation and download
    console.log('[TEST] Waiting 6 seconds for file generation & download...');
    await sleep(6000);

    const files = fs.readdirSync(downloadDir);
    console.log('[TEST] Downloaded files:', files);
    for (const f of files) {
      const stats = fs.statSync(path.join(downloadDir, f));
      console.log(`  -> ${f}: ${stats.size} bytes`);
    }

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
  }
}

testPdfClick();
