const { spawn } = require('child_process');
const path = require('path');

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function testSelect() {
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
    await sleep(2000);

    // Open Documentos menu
    await evaluate(`document.querySelectorAll('button').forEach(b => { if (b.innerText.includes('Documentos')) b.click(); })`);
    await sleep(600);

    // Click Orden de estudios
    await evaluate(`
      const opt = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === 'Orden de estudios' && el.closest('.ant-dropdown-menu-item, li, button'));
      if (opt) (opt.closest('.ant-dropdown-menu-item, li, button') || opt).click();
    `);
    await sleep(1200);

    // Check selectors inside modal
    const info = await evaluate(`
      (() => {
        const modal = document.querySelector('.diagnostic-order-modal');
        const selector = modal?.querySelector('.ant-select-selector');
        const searchInput = modal?.querySelector('.ant-select-selection-search-input');
        return {
          modalFound: !!modal,
          selectorFound: !!selector,
          inputFound: !!searchInput
        };
      })()
    `);
    console.log('Modal elements:', info);

    // Click selector
    await evaluate(`
      const sel = document.querySelector('.diagnostic-order-modal .ant-select-selector');
      if (sel) {
        sel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        sel.click();
      }
    `);
    await sleep(800);

    // Check dropdown options
    const optionsInfo = await evaluate(`
      (() => {
        const dropdown = document.querySelector('.diagnostic-order-package-dropdown, .ant-select-dropdown');
        const items = Array.from(document.querySelectorAll('.ant-select-item-option'));
        return {
          dropdownFound: !!dropdown,
          dropdownVisible: dropdown ? window.getComputedStyle(dropdown).display !== 'none' : false,
          itemCount: items.length,
          itemTexts: items.map(i => i.innerText.trim())
        };
      })()
    `);
    console.log('Dropdown items:', optionsInfo);

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
  }
}

testSelect();
