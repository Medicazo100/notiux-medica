const { execSync } = require('child_process');
const dom = execSync('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --window-size=1920,1080 --virtual-time-budget=3000 --dump-dom "http://localhost:3000/?source=pwa"', { maxBuffer: 10 * 1024 * 1024 }).toString();

const labels = [
  'Inicio',
  'Evidencia',
  'Visitas y notas',
  'Pacientes',
  'Documentos',
  'Casos',
  'Llamadas',
  'Perfil',
  'Admin',
  'Referidos',
  'Novedades',
  'App móvil',
  'Medicazo',
  'Buenas tardes'
];

labels.forEach(l => {
  console.log(`Contains "${l}":`, dom.includes(l));
});
