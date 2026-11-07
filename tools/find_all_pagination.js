const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('meta.current_page') || content.includes('meta.total_entries') || content.includes('data.meta')) {
    console.log(`Pagination found in: ${f}`);
    let pos = 0;
    while ((pos = content.indexOf('meta.', pos)) !== -1) {
      console.log(content.slice(Math.max(0, pos - 60), pos + 100));
      pos += 10;
    }
  }
});
