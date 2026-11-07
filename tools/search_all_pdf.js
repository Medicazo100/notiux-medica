const fs = require('fs');
const path = require('path');

function searchInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'qa_screenshots') {
        searchInDir(full);
      }
    } else if (f.endsWith('.js') || f.endsWith('.html')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('prescription.pdf') || content.includes('diagnostic_order.pdf') || content.includes('/pdf') || content.includes('downloadPdf') || content.includes('download_pdf')) {
        console.log('Match in', full);
      }
    }
  }
}

searchInDir('.');
