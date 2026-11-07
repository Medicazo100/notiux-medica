const http = require('http');

async function testEndpoint(name, path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:3000' + path);
    const reqHeaders = { ...headers };
    let postData = null;

    if (data) {
      postData = typeof data === 'string' ? data : JSON.stringify(data);
      if (!reqHeaders['Content-Type']) {
        reqHeaders['Content-Type'] = 'application/json';
      }
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          name,
          path,
          method,
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject({ name, path, error: err.message });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log('       INICIO DE SUITE DE PRUEBAS QA PROFESIONAL - ITACA       ');
  console.log('===============================================================\n');

  const results = [];

  // 1. Root route check: should 302 redirect to /?source=pwa
  try {
    const r1 = await testEndpoint('1. Ruta Raíz sin parámetro (Redirección 302)', '/');
    const passed = r1.statusCode === 302 && r1.headers.location === '/?source=pwa';
    console.log(`[TEST 1] ${r1.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Status: ${r1.statusCode}, Location: ${r1.headers.location})`);
    results.push({ name: r1.name, passed });
  } catch (e) {
    console.log('[TEST 1] Error:', e);
  }

  // 2. Root route with ?source=pwa: should return 200 HTML
  try {
    const r2 = await testEndpoint('2. Ruta Raíz con ?source=pwa', '/?source=pwa');
    const passed = r2.statusCode === 200 && r2.body.includes('Itaca');
    console.log(`[TEST 2] ${r2.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Status: ${r2.statusCode})`);
    results.push({ name: r2.name, passed });
  } catch (e) {
    console.log('[TEST 2] Error:', e);
  }

  // 3. Account endpoint contract
  try {
    const r3 = await testEndpoint('3. Contrato de Cuenta (/account)', '/account');
    const json = JSON.parse(r3.body);
    const passed = r3.statusCode === 200 &&
                   json.capabilities && json.capabilities.can_manage_subscription === true &&
                   json.organization && json.organization.organization_type === 'practice' &&
                   json.user && json.user.uuid === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    console.log(`[TEST 3] ${r3.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Capacidades válidas: ${!!json.capabilities}, Rol: ${json.organization?.membership_role})`);
    results.push({ name: r3.name, passed });
  } catch (e) {
    console.log('[TEST 3] Error:', e);
  }

  // 4. Patients API: GET /patients/?page=1
  try {
    const r4 = await testEndpoint('4. Carga de Pacientes (/patients/?page=1)', '/patients/?page=1');
    const json = JSON.parse(r4.body);
    const passed = r4.statusCode === 200 &&
                   Array.isArray(json.patients) &&
                   json.meta && json.meta.current_page === 1 &&
                   typeof json.meta.total_entries === 'number';
    console.log(`[TEST 4] ${r4.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Pacientes: ${json.patients?.length}, Meta entries: ${json.meta?.total_entries})`);
    results.push({ name: r4.name, passed });
  } catch (e) {
    console.log('[TEST 4] Error:', e);
  }

  // 5. Patients Tags: GET /patients/tags
  try {
    const r5 = await testEndpoint('5. Etiquetas de Pacientes (/patients/tags)', '/patients/tags');
    const json = JSON.parse(r5.body);
    const passed = r5.statusCode === 200 && Array.isArray(json.tags) && json.tags.length > 0;
    console.log(`[TEST 5] ${r5.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Etiquetas disponibles: ${json.tags?.join(', ')})`);
    results.push({ name: r5.name, passed });
  } catch (e) {
    console.log('[TEST 5] Error:', e);
  }

  // 6. Organization Members & Invites: GET /organization_members and /organization_invites
  try {
    const r6a = await testEndpoint('6a. Miembros de Equipo (/organization_members)', '/organization_members');
    const jsonA = JSON.parse(r6a.body);
    const passedA = r6a.statusCode === 200 && Array.isArray(jsonA.members) && jsonA.members.length > 0;

    const r6b = await testEndpoint('6b. Invitaciones de Equipo (/organization_invites)', '/organization_invites');
    const jsonB = JSON.parse(r6b.body);
    const passedB = r6b.statusCode === 200 && Array.isArray(jsonB.invites);

    const passed = passedA && passedB;
    console.log(`[TEST 6] Equipo (/organization_members & /organization_invites): ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Miembros: ${jsonA.members?.length}, Invites: ${jsonB.invites?.length})`);
    results.push({ name: '6. Módulo de Equipo (/organization_members & invites)', passed });
  } catch (e) {
    console.log('[TEST 6] Error:', e);
  }

  // 7. Cases API: GET /cases/?page=1 & /cases/tags
  try {
    const r7 = await testEndpoint('7a. Carga de Casos (/cases/?page=1)', '/cases/?page=1');
    const json = JSON.parse(r7.body);
    const passedA = r7.statusCode === 200 &&
                    Array.isArray(json.cases) &&
                    json.meta && json.meta.current_page === 1 &&
                    typeof json.meta.records_limit === 'number';

    const r7b = await testEndpoint('7b. Etiquetas de Casos (/cases/tags)', '/cases/tags');
    const jsonB = JSON.parse(r7b.body);
    const passedB = r7b.statusCode === 200 && Array.isArray(jsonB.gen_tags);

    const passed = passedA && passedB;
    console.log(`[TEST 7] Casos (/cases & /cases/tags): ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Casos: ${json.cases?.length}, Tags: ${jsonB.gen_tags?.length})`);
    results.push({ name: '7. Módulo de Casos (/cases/?page=1 & /cases/tags)', passed });
  } catch (e) {
    console.log('[TEST 7] Error:', e);
  }

  // 8. Sessions / Visitas API: GET /sessions/?page=1 & /sessions/clinical_tags
  try {
    const r8 = await testEndpoint('8a. Carga de Visitas (/sessions/?page=1)', '/sessions/?page=1');
    const json = JSON.parse(r8.body);
    const passedA = r8.statusCode === 200 &&
                    Array.isArray(json.sessions) &&
                    json.meta && json.meta.current_page === 1 &&
                    typeof json.meta.total_entries === 'number';

    const r8b = await testEndpoint('8b. Etiquetas Clínicas de Visitas (/sessions/clinical_tags)', '/sessions/clinical_tags');
    const jsonB = JSON.parse(r8b.body);
    const passedB = r8b.statusCode === 200 && Array.isArray(jsonB.clinical_tags);

    const passed = passedA && passedB;
    console.log(`[TEST 8] Visitas y Notas (/sessions & /sessions/clinical_tags): ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Visitas: ${json.sessions?.length}, Tags: ${jsonB.clinical_tags?.length})`);
    results.push({ name: '8. Visitas y Notas (/sessions & clinical_tags)', passed });
  } catch (e) {
    console.log('[TEST 8] Error:', e);
  }

  // 9. Calls API: GET /calls
  try {
    const r9 = await testEndpoint('9. Módulo Llamadas (/calls)', '/calls');
    const json = JSON.parse(r9.body);
    const passed = r9.statusCode === 200 &&
                   Array.isArray(json.calls) &&
                   json.meta && json.meta.current_page === 1;
    console.log(`[TEST 9] ${r9.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Llamadas: ${json.calls?.length}, Meta total: ${json.meta?.total_entries})`);
    results.push({ name: r9.name, passed });
  } catch (e) {
    console.log('[TEST 9] Error:', e);
  }

  // 10. Documents API: GET /documents
  try {
    const r10 = await testEndpoint('10. Módulo Documentos (/documents)', '/documents');
    const json = JSON.parse(r10.body);
    const passed = r10.statusCode === 200 &&
                    Array.isArray(json.documents) &&
                    json.meta && json.meta.current_page === 1;
    console.log(`[TEST 10] ${r10.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Documentos: ${json.documents?.length})`);
    results.push({ name: r10.name, passed });
  } catch (e) {
    console.log('[TEST 10] Error:', e);
  }

  // 11. Evidencia API: GET /queries
  try {
    const r11 = await testEndpoint('11. Módulo Evidencia (/queries)', '/queries');
    const json = JSON.parse(r11.body);
    const passed = r11.statusCode === 200 &&
                    Array.isArray(json.queries) &&
                    json.meta && json.meta.current_page === 1;
    console.log(`[TEST 11] ${r11.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'} (Consultas guardadas: ${json.queries?.length})`);
    results.push({ name: r11.name, passed });
  } catch (e) {
    console.log('[TEST 11] Error:', e);
  }

  // 12. AI Generation: POST /queries with real Gemini call
  console.log('\n--- Probando Generación de IA en Vivo con Gemini API ---');
  try {
    const r12 = await testEndpoint('12. Generación de Respuesta Clínica con Gemini (POST /queries)', '/queries', 'POST', {
      question: '¿Cuál es la dosis de inicio y titulación de semaglutida en diabetes tipo 2?',
      deep_research: false
    });
    const json = JSON.parse(r12.body);
    const passed = r12.statusCode === 200 &&
                   json.gen_answer && json.gen_answer.length > 50 &&
                   Array.isArray(json.gen_citations);
    console.log(`[TEST 12] ${r12.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'}`);
    console.log('Extracto de respuesta generada por Gemini:');
    console.log(json.gen_answer.slice(0, 300) + '...\n');
    results.push({ name: r12.name, passed });
  } catch (e) {
    console.log('[TEST 12] Error:', e);
  }

  // 13. AI Differential Diagnosis: POST /cases with real Gemini call
  try {
    const r13 = await testEndpoint('13. Diagnóstico Diferencial con Gemini (POST /cases)', '/cases', 'POST', {
      title: 'Pérdida de peso involuntaria y diarrea crónica acuosa',
      summary: 'Hombre de 35 años con diarrea de 6 semanas sin sangre visible, flatulencia y pérdida ponderal de 7 kg.'
    });
    const json = JSON.parse(r13.body);
    const passed = r13.statusCode === 200 &&
                   json.uuid &&
                   Array.isArray(json.differential_diagnoses) &&
                   json.differential_diagnoses.length > 0 &&
                   Array.isArray(json.text_entries) &&
                   json.text_entries[0]?.completed === true;
    console.log(`[TEST 13] ${r13.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'}`);
    console.log('Diagnósticos diferenciales generados:');
    json.differential_diagnoses.forEach((d, idx) => {
      console.log(`  ${idx + 1}. [${d.probability}] ${d.name} - ${d.reasoning?.slice(0, 80)}...`);
    });
    results.push({ name: r13.name, passed });
  } catch (e) {
    console.log('[TEST 13] Error:', e);
  }

  // 14. AI Note Generation: POST /sessions with real Gemini call
  try {
    const r14 = await testEndpoint('14. Generación de Nota SOAP con Gemini (POST /sessions)', '/sessions', 'POST', {
      title: 'Consulta subsecuente: Migraña episódica',
      observations: 'Paciente femenina de 30 años con 4 crisis migrañosas al mes. Se inicia profilaxis con topiramato.'
    });
    const json = JSON.parse(r14.body);
    const note = json.notes?.[0];
    const passed = r14.statusCode === 200 &&
                   json.uuid &&
                   note && note.gen_body && note.gen_body.includes('Subjetivo') || note.gen_body?.length > 100;
    console.log(`\n[TEST 14] ${r14.name}: ${passed ? 'PASÓ ✅' : 'FALLÓ ❌'}`);
    console.log('Extracto de la nota SOAP generada:');
    console.log((note?.gen_body || '').slice(0, 250) + '...\n');
    results.push({ name: r14.name, passed });
  } catch (e) {
    console.log('[TEST 14] Error:', e);
  }

  console.log('===============================================================');
  const allPassed = results.every(r => r.passed);
  console.log(`TOTAL PRUEBAS: ${results.length} | PASADAS: ${results.filter(r => r.passed).length} | FALLADAS: ${results.filter(r => !r.passed).length}`);
  console.log(`ESTADO GENERAL DE LA SUITE: ${allPassed ? 'TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% OK) 🎉' : 'ALGUNA PRUEBA FALLÓ ⚠️'}`);
  console.log('===============================================================');
}

runTestSuite();
