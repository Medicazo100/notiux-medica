const fs = require('fs');
const code = fs.readFileSync('itaca-assets/PatientSelectorPanel-BG8a_yD3.js', 'utf8');

const matches = [];
let re = /\b(?:function\s+an|an\s*=\s*(?:function|\([^)]*\)\s*=>))/g;
let m;
while ((m = re.exec(code)) !== null) {
  console.log('Match at', m.index, code.substring(m.index, m.index + 500));
}
