const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://app.itaca.pro';
const dir = path.join(__dirname, 'itaca-assets');

const files = fs.readdirSync(dir);
const discovered = new Set();

const assetRegexes = [
  /\/itaca-assets\/[a-zA-Z0-9_\-\.]+\.(?:js|css|svg|png|jpg|jpeg|woff2?|ttf|eot|ico)/g,
  /["']([a-zA-Z0-9_\-\.]+\.(?:js|css|svg|png|jpg|jpeg|woff2?|ttf|eot|ico))["']/g
];

files.forEach(f => {
  if (f.endsWith('.js') || f.endsWith('.css')) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    
    // Check full path matches
    const m1 = content.match(assetRegexes[0]);
    if (m1) {
      m1.forEach(item => discovered.add(item));
    }
  }
});

console.log('Total discovered asset paths from scanning js/css:', discovered.size);

const existing = new Set(files.map(f => `/itaca-assets/${f}`));
const missing = Array.from(discovered).filter(item => !existing.has(item));

console.log('Missing assets to fetch:', missing.length);
console.log(missing);

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
  if (missing.length === 0) {
    console.log('No missing assets.');
    return;
  }
  for (let i = 0; i < missing.length; i += 10) {
    const chunk = missing.slice(i, i + 10);
    const chunkResults = await Promise.all(chunk.map(download));
    console.log(`Fetched ${Math.min(i + 10, missing.length)}/${missing.length}`);
  }
  console.log('Done scanning stage 2.');
}

run();
