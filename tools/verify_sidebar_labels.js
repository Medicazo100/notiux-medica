const { execSync } = require('child_process');
const dom = execSync('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --dump-dom "http://localhost:3000/?source=pwa"', { maxBuffer: 10 * 1024 * 1024 }).toString();

const labels = ['Inicio', 'Evidencia', 'Visitas y notas', 'Pacientes', 'Documentos', 'Casos', 'Llamadas', 'Perfil', 'Actualizar plan', 'Admin', 'Referidos', 'Novedades', 'App móvil'];
labels.forEach(l => {
  console.log(`Contains "${l}":`, dom.includes(l));
});
