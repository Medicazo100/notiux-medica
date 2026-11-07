const fs = require('fs');
const path = require('path');

function inspectFile(filename) {
  const content = fs.readFileSync(path.join(__dirname, '..', 'itaca-assets', filename), 'utf8');
  console.log(`=== File: ${filename} ===`);
  // Look for any string with /
  const matches = content.match(/\/([a-zA-Z0-9_\-\/]+)/g) || [];
  const unique = Array.from(new Set(matches)).filter(m => 
    !m.startsWith('/assets') && !m.startsWith('/images') && !m.startsWith('//') && m.length > 2
  );
  console.log('Endpoints/Paths found:', unique.slice(0, 30));
}

['Patients-DO9atCaJ.js', 'Cases-BX6g0v_v.js', 'Sessions-1EuGS1t4.js', 'Calls-CsW1n2cW.js', 'Team-CUwyxT7E.js'].forEach(inspectFile);
