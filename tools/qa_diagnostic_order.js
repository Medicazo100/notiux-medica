const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const qaDir = path.join(__dirname, '..', 'qa_screenshots');
if (!fs.existsSync(qaDir)) fs.mkdirSync(qaDir, { recursive: true });

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runQA() {
  console.log('[QA] Starting Chrome in headless mode with remote debugging...');
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
      const newRes = await fetch('http://localhost:9222/json/new?http://localhost:3000/patients/8435b424-f10f-4fef-8e82-ab0b4c20735a', { method: 'PUT' });
      pageTarget = await newRes.json();
    }

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

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    console.log('[QA] Connected to Chrome DevTools Protocol!');

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

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

    async function takeScreenshot(name) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(qaDir, name);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`[QA] Screenshot saved: ${name}`);
      return filePath;
    }

    console.log('[QA] 1. Navigating to Pedro Suarez patient page...');
    await send('Page.navigate', { url: 'http://localhost:3000/patients/8435b424-f10f-4fef-8e82-ab0b4c20735a' });
    await sleep(2500);
    await takeScreenshot('01_patient_page.png');

    console.log('[QA] 2. Opening Documentos dropdown...');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const docsBtn = buttons.find(b => b.innerText.includes('Documentos'));
        if (docsBtn) docsBtn.click();
      })()
    `);
    await sleep(600);
    await takeScreenshot('02_documents_dropdown.png');

    console.log('[QA] 3. Clicking "Orden de estudios"...');
    await evaluate(`
      (() => {
        const opt = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === 'Orden de estudios' && el.closest('.ant-dropdown-menu-item, li, button'));
        if (opt) (opt.closest('.ant-dropdown-menu-item, li, button') || opt).click();
      })()
    `);
    await sleep(1500);

    console.log('[QA] 4. Opening package selector dropdown...');
    await evaluate(`
      (() => {
        const sel = document.querySelector('.diagnostic-order-modal .ant-select-selector');
        if (sel) {
          sel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          sel.click();
        }
      })()
    `);
    await sleep(800);
    await takeScreenshot('03_packages_dropdown.png');

    console.log('[QA] 5. Selecting "Anemia / fatiga básico"...');
    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('.ant-select-item-option'));
        const opt = items.find(i => i.innerText.includes('Anemia / fatiga básico'));
        if (opt) {
          opt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          opt.click();
        }
      })()
    `);
    await sleep(800);

    console.log('[QA] 6. Opening selector again and selecting "Evaluación hepática"...');
    await evaluate(`
      (() => {
        const sel = document.querySelector('.diagnostic-order-modal .ant-select-selector');
        if (sel) {
          sel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          sel.click();
        }
      })()
    `);
    await sleep(600);

    await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('.ant-select-item-option'));
        const opt = items.find(i => i.innerText.includes('Evaluación hepática'));
        if (opt) {
          opt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          opt.click();
        }
      })()
    `);
    await sleep(1000);
    await takeScreenshot('04_selected_packages.png');

    console.log('[QA] 7. Clicking "Generar orden"...');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const genBtn = buttons.find(b => b.innerText.includes('Generar orden'));
        if (genBtn) genBtn.click();
      })()
    `);
    await sleep(3000);
    await takeScreenshot('05_generated_order.png');

    console.log('[QA] 8. Testing "Enviar" button in drawer...');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const sendBtn = buttons.find(b => b.innerText.includes('Enviar'));
        if (sendBtn) sendBtn.click();
      })()
    `);
    await sleep(1000);
    await takeScreenshot('06_send_options_modal.png');

    console.log('[QA] All steps completed successfully!');
    ws.close();
  } catch (err) {
    console.error('[QA ERROR]:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
  }
}

runQA();
