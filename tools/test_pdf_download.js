const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const downloadDir = path.join(__dirname, 'test_downloads');
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function testDownload() {
  console.log('[TEST] Starting Chrome in headless mode with remote debugging...');
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

    if (!pageTarget) {
      const newRes = await fetch('http://localhost:9222/json/new?http://localhost:3000/patients/8435b424-f10f-4fef-8e82-ab0b4c20735a#documents', { method: 'PUT' });
      pageTarget = await newRes.json();
    }

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Page.downloadWillBegin') {
        console.log('[TEST] Page.downloadWillBegin event:', msg.params);
      }
      if (msg.method === 'Page.downloadProgress') {
        console.log('[TEST] Page.downloadProgress event:', msg.params.state, msg.params.receivedBytes + '/' + msg.params.totalBytes);
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

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
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(JSON.stringify(res.exceptionDetails));
      }
      return res.result?.value;
    }

    console.log('[TEST] Navigating to Pedro Suarez patient page...');
    await send('Page.navigate', { url: 'http://localhost:3000/patients/8435b424-f10f-4fef-8e82-ab0b4c20735a#documents' });
    await sleep(2500);

    // Switch to Documentos tab if needed
    await evaluate(`
      (() => {
        const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, button, [role="tab"]'));
        const docTab = tabs.find(t => t.innerText && t.innerText.trim() === 'Documentos');
        if (docTab) docTab.click();
      })()
    `);
    await sleep(800);

    // Click on Orden de estudios document in list
    console.log('[TEST] Clicking on Orden de estudios in documents list...');
    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('*'));
        const doc = items.find(el => el.innerText && el.innerText.trim() === 'Orden de estudios' && el.offsetParent !== null && !el.closest('.ant-dropdown'));
        if (doc) doc.click();
      })()
    `);
    await sleep(1500);

    // Click the PDF button
    console.log('[TEST] Clicking PDF button in drawer...');
    await evaluate(`
      (() => {
        const btn = document.querySelector('[data-testid="download-pdf-button"]');
        if (btn) btn.click();
        else {
          const buttons = Array.from(document.querySelectorAll('button'));
          const pdfBtn = buttons.find(b => b.innerText.includes('PDF'));
          if (pdfBtn) pdfBtn.click();
        }
      })()
    `);

    // Wait for download to process
    console.log('[TEST] Waiting for download...');
    await sleep(4000);

    const files = fs.readdirSync(downloadDir);
    console.log('[TEST] Downloaded files in dir:', files);
    for (const f of files) {
      const stat = fs.statSync(path.join(downloadDir, f));
      console.log(`  File: ${f}, Size: ${stat.size} bytes`);
    }

    console.log('[TEST] Test completed successfully!');
    ws.close();
  } catch (err) {
    console.error('[TEST ERROR]:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
  }
}

testDownload();
