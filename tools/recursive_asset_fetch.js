const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://app.itaca.pro';
const dir = path.join(__dirname, 'itaca-assets');

async function download(relPath) {
  const url = baseUrl + '/' + relPath.replace(/^\//, '');
  const localPath = path.join(__dirname, relPath.replace(/^\//, '').replace(/\//g, path.sep));
  const fdir = path.dirname(localPath);
  if (!fs.existsSync(fdir)) {
    fs.mkdirSync(fdir, { recursive: true });
  }

  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(localPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve({ path: relPath, status: 200, size: fs.statSync(localPath).size });
        });
      } else {
        resolve({ path: relPath, status: res.statusCode });
      }
    }).on('error', (err) => {
      resolve({ path: relPath, error: err.message });
    });
  });
}

async function recursiveScan() {
  let round = 1;
  while (true) {
    console.log(`\n=== Round ${round} ===`);
    const files = fs.readdirSync(dir);
    const existing = new Set(files.map(f => 'itaca-assets/' + f));
    const newlyFound = new Set();

    const chunkRegex = /["'](?:(?:\.\/)?|\/itaca-assets\/)([a-zA-Z0-9_\-\.]+\.(?:js|css|svg|png|jpg|woff2?))["']/g;

    files.forEach(f => {
      if (f.endsWith('.js') || f.endsWith('.css')) {
        const content = fs.readFileSync(path.join(dir, f), 'utf8');
        let m;
        while ((m = chunkRegex.exec(content)) !== null) {
          const item = m[1];
          if (!item.startsWith('http') && item.includes('-')) {
            const rel = 'itaca-assets/' + item;
            if (!existing.has(rel)) {
              newlyFound.add(rel);
            }
          }
        }
      }
    });

    const missingList = Array.from(newlyFound);
    console.log(`Discovered ${missingList.length} missing files in round ${round}`);
    if (missingList.length === 0) {
      console.log('Zero missing files. Assets are 100% complete!');
      break;
    }

    for (let i = 0; i < missingList.length; i += 10) {
      const chunk = missingList.slice(i, i + 10);
      const chunkResults = await Promise.all(chunk.map(download));
      const ok = chunkResults.filter(r => r.status === 200).length;
      console.log(`Downloaded batch ${Math.floor(i / 10) + 1}: ${ok}/${chunk.length}`);
    }
    round++;
    if (round > 5) break;
  }
}

recursiveScan();
