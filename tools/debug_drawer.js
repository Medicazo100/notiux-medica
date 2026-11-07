const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function debugDrawer() {
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
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
      return res.result?.value;
    }

    await send('Page.navigate', { url: 'http://localhost:3000/patients/8435b424-f10f-4fef-8e82-ab0b4c20735a#documents' });
    await sleep(2500);

    // Click Documentos tab
    await evaluate(`
      const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, div, span'));
      const docTab = tabs.find(t => t.innerText && t.innerText.trim() === 'Documentos' && t.classList.contains('ant-tabs-tab'));
      if (docTab) docTab.click();
    `);
    await sleep(1000);

    // Look for document rows
    const rows = await evaluate(`
      (() => {
        const docRows = Array.from(document.querySelectorAll('.document-row, [data-testid="document-item"], .ant-list-item, div'));
        const matched = docRows.filter(r => r.innerText && r.innerText.includes('Orden de estudios'));
        return {
          count: matched.length,
          texts: matched.map(m => m.innerText.slice(0, 50))
        };
      })()
    `);
    console.log('Document rows:', rows);

    // Click on document
    await evaluate(`
      (() => {
        const els = Array.from(document.querySelectorAll('div, span, a'));
        const doc = els.find(e => e.innerText && e.innerText.trim() === 'Orden de estudios' && e.children.length === 0);
        if (doc) doc.click();
      })()
    `);
    await sleep(1500);

    // Check if drawer is open and check PDF button
    const drawerInfo = await evaluate(`
      (() => {
        const drawer = document.querySelector('.ant-drawer, .patient-document-drawer');
        const pdfBtn = document.querySelector('[data-testid="download-pdf-button"]');
        return {
          drawerFound: !!drawer,
          pdfBtnFound: !!pdfBtn,
          buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)
        };
      })()
    `);
    console.log('Drawer info:', drawerInfo);

    // Capture screenshot
    const res = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'qa_screenshots', 'debug_drawer.png'), Buffer.from(res.data, 'base64'));

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
  }
}

debugDrawer();
