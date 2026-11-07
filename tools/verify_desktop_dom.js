const { execSync } = require('child_process');
const dom = execSync('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --window-size=1920,1080 --virtual-time-budget=3000 --dump-dom "http://localhost:3000/?source=pwa"', { maxBuffer: 10 * 1024 * 1024 }).toString();

const queries = [
  '¿Por dónde quiere empezar?',
  'Documentar consultas',
  'Investigar una pregunta clínica',
  'Desarrollar un diagnóstico diferencial',
  'Trabajar con mi equipo',
  'Con el paciente presente',
  'Sin el paciente',
  'Prueba una demostración'
];

queries.forEach(q => {
  console.log(`Contains "${q}":`, dom.includes(q));
});
