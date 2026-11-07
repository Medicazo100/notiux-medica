const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://app.itaca.pro';

const html = fs.readFileSync('index.html', 'utf8');
const regex = /\/itaca-assets\/[^"' >]+/g;
const matches = Array.from(new Set(html.match(regex) || []));

// Also add other assets mentioned in index.html
const extraAssets = [
  '/manifest.json',
  '/favicon2.ico',
  '/apple-touch-icon.png',
  '/logo_es.png',
  '/medprofile-mark.svg'
];

const allAssets = [...matches, ...extraAssets];

console.log(`Starting download of ${allAssets.length} assets...`);

async function download(relPath) {
  const url = baseUrl + relPath;
  const localPath = path.join(__dirname, relPath.replace(/^\//, '').replace(/\//g, path.sep));
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
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
  const results = [];
  // batch download in groups of 10
  for (let i = 0; i < allAssets.length; i += 10) {
    const chunk = allAssets.slice(i, i + 10);
    const chunkResults = await Promise.all(chunk.map(download));
    results.push(...chunkResults);
    process.stdout.write(`Downloaded ${Math.min(i + 10, allAssets.length)}/${allAssets.length}\r`);
  }
  console.log('\nFinished initial batch.');
  const failed = results.filter(r => r.status !== 200);
  console.log('Success:', results.length - failed.length, 'Failed:', failed.length);
  if (failed.length > 0) {
    console.log('Failed assets:', failed);
  }
}

run();
