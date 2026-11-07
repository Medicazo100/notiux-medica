const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'AccountContext-_7AQjCqp.js');
if (fs.existsSync(file)) {
  console.log('AccountContext:');
  console.log(fs.readFileSync(file, 'utf8').slice(0, 2000));
}
const useAcc = path.join(dir, 'useAccount-b-S5SSi8.js');
if (fs.existsSync(useAcc)) {
  console.log('useAccount:');
  console.log(fs.readFileSync(useAcc, 'utf8').slice(0, 2000));
}
