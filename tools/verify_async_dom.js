const { execSync } = require('child_process');
try {
  const dom = execSync('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --virtual-time-budget=3000 --dump-dom "http://localhost:3000/?source=pwa"', { maxBuffer: 10 * 1024 * 1024 }).toString();

  const labels = ['Inicio', 'Evidencia', 'Visitas y notas', 'Pacientes', 'Documentos', 'Casos', 'Llamadas', 'Perfil', 'Actualizar plan', 'Admin', 'Referidos', 'Novedades', 'App móvil', '¿Por dónde quiere empezar?', 'Con el paciente presente'];
  labels.forEach(l => {
    console.log(`Contains "${l}":`, dom.includes(l));
  });
} catch (e) {
  console.error(e.message);
}
