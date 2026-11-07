const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const file = path.join(dir, 'index-Ctl6RXvm.js');
const content = fs.readFileSync(file, 'utf8');

// search for navigation items
const items = ['Visitas y notas', 'App móvil', 'Referidos', 'Actualizar plan'];
items.forEach(item => {
  const idx = content.indexOf(item);
  console.log(`"${item}" in index:`, idx);
});
