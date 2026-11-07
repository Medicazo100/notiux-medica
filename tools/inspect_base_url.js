const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'itaca-assets', 'errorHandling-BGzTg7xQ.js');
const content = fs.readFileSync(file, 'utf8');

// search for api url or backend url
const regex = /(?:https?:\/\/[a-zA-Z0-9_\-\.]+(?::[0-9]+)?|\/api\/[a-zA-Z0-9_\-]+)/g;
const matches = Array.from(new Set(content.match(regex) || []));
console.log('Matches in errorHandling:', matches);

// Let's also find where Ct is defined or exported in errorHandling-BGzTg7xQ.js
const ctIndex = content.indexOf('Ct=');
if (ctIndex !== -1) {
  console.log('Ct definition snippet:');
  console.log(content.slice(Math.max(0, ctIndex - 100), ctIndex + 300));
} else {
  // search for export { ... as Ct }
  const expMatch = content.match(/([a-zA-Z0-9_$]+)\s+as\s+Ct/);
  console.log('Ct exported name:', expMatch);
  if (expMatch) {
    const internalName = expMatch[1];
    const defIndex = content.indexOf(internalName + '=');
    console.log(internalName, 'definition:');
    console.log(content.slice(Math.max(0, defIndex - 100), defIndex + 300));
  }
}
