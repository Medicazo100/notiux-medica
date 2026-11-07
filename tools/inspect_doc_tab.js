const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function inspectDocTab() {
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

    await send('Page.navigate', { url: 'http://localhost:3000/patients/8435b424-f10f-4fef-8e82-ab0b4c20735a' });
    await sleep(2500);

    // Click Documentos tab
    await evaluate(`
      const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab'));
      const docTab = tabs.find(t => t.innerText && t.innerText.trim() === 'Documentos');
      if (docTab) docTab.click();
    `);
    await sleep(1000);

    const docItems = await evaluate(`
      (() => {
        const all = Array.from(document.querySelectorAll('*'));
        return all.filter(el => {
          return el.children.length === 0 && (el.innerText.includes('Orden') || el.innerText.includes('Receta'));
        }).map(el => ({ tag: el.tagName, text: el.innerText, class: el.className }));
      })()
    `);
    console.log('Doc items in DOM:', docItems);

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
  }
}

inspectDocTab();
