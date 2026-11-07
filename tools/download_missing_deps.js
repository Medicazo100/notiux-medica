const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://app.itaca.pro';
const deps = JSON.parse(fs.readFileSync('all_vite_deps.json', 'utf8'));

const dir = path.join(__dirname, 'itaca-assets');
const existingFiles = new Set(fs.readdirSync(dir).map(f => 'itaca-assets/' + f));

const missing = deps.filter(d => !existingFiles.has(d));
console.log(`Total deps: ${deps.length}, Missing: ${missing.length}`);
console.log('Missing list:', missing);

async function download(relPath) {
  const url = baseUrl + '/' + relPath;
  const localPath = path.join(__dirname, relPath.replace(/\//g, path.sep));
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
    console.log(`Downloaded batch ${Math.floor(i / 10) + 1}: ${ok}/${chunk.length}`);
  }
  console.log('All missing deps fetched!');
}

run();
