const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://app.itaca.pro';
const dir = path.join(__dirname, 'itaca-assets');

const files = fs.readdirSync(dir);
const jsFiles = files.filter(f => f.endsWith('.js'));

const chunkRegex = /["'](\/itaca-assets\/[a-zA-Z0-9_\-\.]+\.js)["']/g;
const chunkRegexRel = /["'](\.\/)?([a-zA-Z0-9_\-\.]+\.js)["']/g;

const allFound = new Set();

jsFiles.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  let match;
  while ((match = chunkRegex.exec(content)) !== null) {
    allFound.add(match[1]);
  }
  while ((match = chunkRegexRel.exec(content)) !== null) {
    if (!match[2].startsWith('http') && match[2].includes('-')) {
      allFound.add('/itaca-assets/' + match[2]);
    }
  }
});

console.log('Total referenced JS chunks:', allFound.size);
const existing = new Set(files.map(f => `/itaca-assets/${f}`));
const missing = Array.from(allFound).filter(x => !existing.has(x));
console.log('Missing JS chunks:', missing.length);
if (missing.length > 0) {
  console.log('Missing list:', missing.slice(0, 50));
}

async function download(relPath) {
  const url = baseUrl + relPath;
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

async function run() {
  if (missing.length === 0) return;
  for (let i = 0; i < missing.length; i += 10) {
    const chunk = missing.slice(i, i + 10);
    const chunkResults = await Promise.all(chunk.map(download));
    const ok = chunkResults.filter(r => r.status === 200).length;
    console.log(`Downloaded batch ${i / 10 + 1}: ${ok}/${chunk.length} found`);
  }
}

run();
