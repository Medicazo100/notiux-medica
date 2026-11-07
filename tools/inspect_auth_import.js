const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'itaca-assets', 'authRequest-C5hHUNbV.js');
const content = fs.readFileSync(file, 'utf8');

// import { Ct as o, ... } from "./errorHandling-BGzTg7xQ.js"
const m = content.match(/import\s*\{([^}]+)\}\s*from\s*["']\.\/errorHandling-BGzTg7xQ\.js["']/);
console.log('Imports from errorHandling in authRequest:', m ? m[1] : 'not found');
