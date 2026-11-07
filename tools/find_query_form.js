const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('query_form.fields.enter_question') || content.includes('query_form')) {
    console.log(`query_form found in: ${f}`);
  }
});
