const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'itaca-assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const searchPhrases = [
  '¿Por dónde quiere empezar?',
  'Documentar consultas',
  'Investigar una pregunta clínica',
  'Desarrollar un diagnóstico diferencial',
  'Con el paciente presente',
  'Sin el paciente',
  'Prueba una demostración'
];

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  searchPhrases.forEach(p => {
    if (content.includes(p)) {
      console.log(`Found "${p}" in ${f}`);
    }
  });
});
