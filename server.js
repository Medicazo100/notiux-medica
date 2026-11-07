const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');
const { getNoteTypeMarkdownPreview, getNoteTypeName, buildClinicalNoteForSession } = require('./clinical_note_helper');

// Global safety net: never crash the server
process.on('uncaughtException', (err) => {
  console.error('[SERVER CAUGHT ERROR]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[SERVER CAUGHT REJECTION]:', reason);
});

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envPath);
    } else {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [k, ...v] = trimmed.split('=');
          if (process.env[k.trim()] === undefined) {
            process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
    console.log('[ENV] Archivo .env cargado correctamente.');
  } catch (e) {
    console.error('[ENV ERROR]:', e.message);
  }
}

const PORT = process.env.PORT || 3000;
const PORT_WAS_EXPLICIT = Boolean(process.env.PORT);
const HOST = process.env.HOST || (process.env.VERCEL ? '0.0.0.0' : '127.0.0.1');
const allowedOrigins = new Set((process.env.CORS_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean));
const DB_FILE = process.env.ITACA_DB_FILE || path.join(__dirname, 'mock_db.json');

// Helper for Real AI Generation with Google Gemini API & fallback models
async function generateWithAI(prompt, systemInstruction = "Eres un asistente médico experto de Notiux Médica para profesionales de la salud. Responde de forma clínica, rigurosa, estructurada y en español.") {
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS) || 45000;
  const deadline = Date.now() + timeoutMs;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    // List of candidate models in order of speed and stability
    const models = [
      process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest'
    ];

    for (const model of [...new Set(models.filter(Boolean))]) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) break;
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
        const payload = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        };
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(Math.min(15000, remainingMs))
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          console.warn(`[GEMINI WARN] Model ${model} returned ${res.status}:`, (await res.text()).slice(0, 150));
        }
      } catch (e) {
        console.warn(`[GEMINI EXCEPTION] Model ${model}:`, e.message);
      }
    }
  }

  // Fallback: OpenAI / DeepSeek / Groq compatible API if configured
  const compatKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || process.env.DEEPSEEK_API_KEY;
  const remainingMs = deadline - Date.now();
  if (compatKey && remainingMs > 0) {
    try {
      const baseURL = process.env.AI_BASE_URL || (process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : 'https://api.openai.com/v1');
      const model = process.env.AI_MODEL || (process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${compatKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ]
        }),
        signal: AbortSignal.timeout(Math.min(15000, remainingMs))
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (e) {
      console.warn('[AI COMPAT EXCEPTION]:', e.message);
    }
  }

  return null;
}

// Load DB
let db = {
  patients: [],
  sessions: [],
  cases: [],
  queries: [],
  documents: [],
  calls: [],
  invites: [],
  order_packages: []
};

if (fs.existsSync(DB_FILE)) {
  try {
    const storedDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    db = { ...db, ...storedDb };
  } catch (e) {
    console.error('Error parsing mock_db.json:', e);
  }
}

for (const collection of ['patients', 'sessions', 'cases', 'queries', 'documents', 'calls', 'invites', 'intake_requests', 'order_packages']) {
  if (!Array.isArray(db[collection])) db[collection] = [];
}

function getPage(collection, page, perPage, filters = {}) {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  let records = Array.isArray(collection) ? collection : [];
  const selectedTags = (Array.isArray(filters.tags) ? filters.tags : filters.tags ? [filters.tags] : []).filter(Boolean);
  if (selectedTags.length) {
    records = records.filter(record => {
      const tags = record.tags || record.clinical_tags || record.gen_tags || [];
      return selectedTags.every(tag => tags.includes(tag));
    });
  }
  const patientUuid = filters.patient_uuid || filters.patient_id;
  if (patientUuid) {
    records = records.filter(record => 
      record.patient_id === patientUuid || record.patient_uuid === patientUuid || 
      record.patient?.uuid === patientUuid || record.patient?.id === patientUuid
    );
  }
  const start = (currentPage - 1) * perPage;
  return { records: records.slice(start, start + perPage), meta: makeMeta(records.length, currentPage, perPage) };
}

function normalizeSession(session) {
  if (!session || typeof session !== 'object') return session;
  const doctorNotes = Array.isArray(session.doctor_notes)
    ? session.doctor_notes
    : Array.isArray(session.notes) ? session.notes : [];
  
  const hasValidNote = doctorNotes.some(n => n && (n.gen_body || n.user_body) && n.completed);
  const status = (session.status === 'completed' && hasValidNote) ? 'finalized' : (session.status || 'in_progress');
  const instructionNotes = Array.isArray(session.patient_instruction_notes) ? session.patient_instruction_notes : [];
  
  return {
    ...session,
    status,
    doctor_notes: doctorNotes,
    notes: doctorNotes,
    patient_instruction_notes: instructionNotes,
    clinical_metadata: session.clinical_metadata || {
      gen_summary: session.gen_summary || '',
      gen_allergy_list: [],
      gen_risk_flags: [],
      gen_tracked_measures: [],
      gen_problem_list: [],
      gen_suspected_condition_list: [],
      gen_medications: session.patient?.items || [],
      gen_interventions: [],
      gen_clinical_findings: [],
      gen_procedures: [],
      gen_history_updates: [],
      gen_investigation_results: [],
      gen_investigation_orders: [],
      gen_functional_status: [],
      gen_goals: []
    }
  };
}

function normalizePatient(p) {
  if (!p || typeof p !== 'object') return p;
  const fullName = p.full_name || p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Paciente';
  
  let rawItems = Array.isArray(p.items) ? p.items : [];
  if (rawItems.length === 0 && Array.isArray(p.medications)) {
    rawItems = p.medications;
  }
  
  const items = rawItems.map((m, idx) => ({
    id: m.id || m.uuid || `med-${idx+1}`,
    uuid: m.id || m.uuid || `med-${idx+1}`,
    name: m.name || '',
    dosage: m.dosage || m.dose || m.presentation || '',
    presentation: m.presentation || m.dosage || m.dose || '',
    frequency: m.frequency || m.instructions || '',
    instructions: m.instructions || m.frequency || '',
    status: m.status || 'ongoing',
    stopped_at: m.stopped_at || null
  }));

  const activeItems = items.filter(m => !m.stopped_at);

  const sections = activeItems.length > 0 ? [
    {
      status: 'ongoing',
      title: 'En curso',
      medications: activeItems.map(m => ({
        id: m.id,
        label: `${m.name} ${m.dosage}`.trim(),
        medication: m
      }))
    }
  ] : [];

  const reconciledItems = {
    medications: {
      has_reviewed_items: items.length > 0,
      source_of_truth: 'session',
      items: items,
      active_labels: activeItems.map(m => `${m.name} ${m.dosage}`.trim()),
      sections: sections
    }
  };

  const reviewedItems = {
    medications: activeItems
  };

  const patientDocs = (db.documents || []).filter(d => 
    d.patient_uuid === p.uuid || d.patient_uuid === p.id ||
    d.patient_id === p.uuid || d.patient_id === p.id ||
    d.patient?.uuid === p.uuid || d.patient?.id === p.id
  ).map(normalizeDocument);

  const patientSessions = (db.sessions || []).filter(s =>
    s.patient_id === p.uuid || s.patient_id === p.id ||
    s.patient_uuid === p.uuid || s.patient_uuid === p.id ||
    s.patient?.uuid === p.uuid || s.patient?.id === p.id
  ).map(normalizeSession);

  const lastSession = patientSessions[0];
  const sessionDateObj = lastSession ? new Date(lastSession.completed_at || lastSession.created_at) : new Date();
  const clinicalContext = lastSession ? {
    kind: 'source',
    freshness: 'fresh',
    source: {
      kind: 'session',
      uuid: lastSession.uuid,
      summary: lastSession.gen_summary || p.summary || '',
      summary_pending: false,
      clinical_date: {
        year: sessionDateObj.getFullYear(),
        month: sessionDateObj.getMonth() + 1,
        day: sessionDateObj.getDate()
      },
      clinical_metadata: lastSession.clinical_metadata || {
        gen_summary: lastSession.gen_summary || p.summary || ''
      }
    }
  } : null;

  return {
    ...p,
    uuid: p.uuid || p.id,
    id: p.uuid || p.id,
    full_name: fullName,
    name: fullName,
    first_name: p.first_name || fullName.split(' ')[0] || '',
    last_name: p.last_name || fullName.split(' ').slice(1).join(' ') || '',
    phone: p.phone || p.mobile_number || '',
    mobile_number: p.mobile_number || p.phone || '',
    email: p.email || '',
    items: items,
    reviewed_items: reviewedItems,
    reconciled_items: reconciledItems,
    documents: patientDocs,
    sessions: patientSessions,
    clinical_context: clinicalContext,
    completed_sessions_count: Math.max(p.completed_sessions_count || 0, patientSessions.length),
    completed_documents_count: Math.max(p.completed_documents_count || 0, patientDocs.length)
  };
}

function normalizeDocument(d) {
  if (!d || typeof d !== 'object') return d;
  const isPrescription = d.doc_type === 'prescription' || d.document_type === 'prescription';
  const isDiagnosticOrder = d.doc_type === 'diagnostic_order' || d.document_type === 'diagnostic_order';
  const targetPatient = (db.patients || []).find(p => p.uuid === d.patient_uuid || p.id === d.patient_uuid || p.uuid === d.patient_id || p.id === d.patient_id) || d.patient;
  
  let rx = d.prescription;
  if (isPrescription) {
    if (!rx || typeof rx !== 'object' || !Array.isArray(rx.prescription_lines)) {
      rx = {
        uuid: d.uuid || 'rx-' + Date.now(),
        id: d.uuid || 'rx-' + Date.now(),
        prescription_lines: [
          {
            position: 1,
            name: "metoclopramida",
            dose: "10mg",
            presentation: "10mg",
            instructions: "10 mg • Tomar cada 12 horas",
            duration: "",
            dispense_quantity: ""
          }
        ],
        general_instructions: [
          "Siga exactamente las indicaciones del profesional tratante.",
          "No suspenda ni modifique el tratamiento sin indicación médica."
        ]
      };
    }
  }

  let diagOrder = d.diagnostic_order;
  if (isDiagnosticOrder) {
    if (!diagOrder || typeof diagOrder !== 'object' || !Array.isArray(diagOrder.order_items)) {
      const orderItems = [];
      const orderGroups = [];
      let currentPos = 1;

      const selectedPkgUuids = Array.isArray(d.order_package_uuids) ? d.order_package_uuids : [];
      const exclusions = d.order_package_item_exclusions || {};

      for (const pkgUuid of selectedPkgUuids) {
        const pkg = (db.order_packages || []).find(p => p.uuid === pkgUuid || p.id === pkgUuid);
        if (!pkg) continue;
        const pkgExclusions = exclusions[pkgUuid] || [];
        const groupPositions = [];
        const items = (pkg.order_package_items || []).filter(item => !pkgExclusions.includes(item.uuid));
        for (const it of items) {
          orderItems.push({
            uuid: it.uuid || ('item-' + currentPos),
            position: currentPos,
            code: it.code || '',
            name: it.name || '',
            indications: it.indications || ''
          });
          groupPositions.push(currentPos);
          currentPos++;
        }
        if (groupPositions.length > 0) {
          orderGroups.push({
            title: pkg.name,
            item_positions: groupPositions,
            instructions: pkg.instructions ? [pkg.instructions] : [],
            source_metadata: { source: 'order_package', package_uuid: pkg.uuid }
          });
        }
      }

      if (d.details && typeof d.details === 'string' && d.details.trim()) {
        const lines = d.details.split('\n').map(l => l.trim()).filter(Boolean);
        const customPositions = [];
        for (const line of lines) {
          let name = line;
          let indications = '';
          if (line.includes(':')) {
            const parts = line.split(':');
            name = parts[0].trim();
            indications = parts.slice(1).join(':').trim();
          } else if (line.includes(' - ')) {
            const parts = line.split(' - ');
            name = parts[0].trim();
            indications = parts.slice(1).join(' - ').trim();
          }
          orderItems.push({
            uuid: 'custom-' + currentPos,
            position: currentPos,
            code: '',
            name,
            indications
          });
          customPositions.push(currentPos);
          currentPos++;
        }
        if (customPositions.length > 0) {
          orderGroups.push({
            title: 'Estudios específicos',
            item_positions: customPositions,
            instructions: [],
            source_metadata: { source: 'custom' }
          });
        }
      }

      diagOrder = {
        uuid: d.uuid || ('diag-' + Date.now()),
        id: d.uuid || ('diag-' + Date.now()),
        order_items: orderItems,
        order_groups: orderGroups,
        general_instructions: [
          "Presentarse en ayuno según las especificaciones de cada estudio.",
          "Informar al personal de laboratorio si consume medicamentos de manera crónica o anticoagulantes.",
          "Acudir con ropa cómoda y sin objetos metálicos en caso de estudios de imagen."
        ]
      };
    }
  }

  let docType = 'clinical_summary';
  let docTitle = 'Documento Clínico';
  if (isPrescription) {
    docType = 'prescription';
    docTitle = 'Receta médica';
  } else if (isDiagnosticOrder) {
    docType = 'diagnostic_order';
    docTitle = 'Orden de estudios';
  } else {
    docType = d.doc_type || d.document_type || 'clinical_summary';
    docTitle = d.gen_title || d.title || 'Documento Clínico';
  }

  return {
    ...d,
    uuid: d.uuid || d.id,
    id: d.uuid || d.id,
    doc_type: docType,
    document_type: docType,
    gen_title: docTitle,
    title: docTitle,
    completed: true,
    completed_at: d.completed_at || d.created_at || new Date().toISOString(),
    created_at: d.created_at || new Date().toISOString(),
    patient_uuid: d.patient_uuid || d.patient_id || targetPatient?.uuid,
    patient_id: d.patient_uuid || d.patient_id || targetPatient?.uuid,
    patient: targetPatient ? {
      ...targetPatient,
      full_name: targetPatient.full_name || targetPatient.name,
      fullName: targetPatient.full_name || targetPatient.name,
      mobile_number: targetPatient.mobile_number || targetPatient.phone,
      mobileNumber: targetPatient.mobile_number || targetPatient.phone,
      email: targetPatient.email || ''
    } : null,
    prescription: isPrescription ? rx : (d.prescription || null),
    diagnostic_order: isDiagnosticOrder ? diagOrder : (d.diagnostic_order || null)
  };
}

function saveDb() {
  try {
    const tmpFile = `${DB_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2));
    fs.renameSync(tmpFile, DB_FILE);
  } catch (e) {
    console.error('Failed to save DB:', e);
  }
}

// Standard Pagination Meta Generator (conforms to Notiux Médica frontend contracts)
function makeMeta(total, page = 1, perPage = 20) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const pp = Math.max(1, parseInt(perPage, 10) || 20);
  const totalPages = Math.ceil(total / pp) || 1;
  return {
    current_page: p,
    per_page: pp,
    total_entries: total,
    total_pages: totalPages,
    records_limit: 1000,
    records_used: total,
    records_remaining: Math.max(0, 1000 - total),
    records_count: total,
    records_exceeded: false,
    supervisors_configured: true
  };
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    const acceptsHtmlDocument = method === 'GET'
      && req.headers['sec-fetch-dest'] === 'document'
      && String(req.headers.accept || '').includes('text/html');

    // Same-origin requests need no CORS. Deployments may allow named origins.
    const requestOrigin = req.headers.origin;
    if (requestOrigin && allowedOrigins.has(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    if (method === 'OPTIONS') {
      if (requestOrigin && !allowedOrigins.has(requestOrigin)) {
        res.writeHead(403);
        return res.end();
      }
      res.writeHead(200);
      return res.end();
    }

    // Helper for JSON response
    const jsonResponse = (statusCode, data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    };

    // Body parser supporting JSON, URL-encoded, and multipart form-data
    const parseBody = (callback) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const result = {};
        if (!body) return callback(null, result);

        try {
          const parsed = JSON.parse(body);
          if (parsed && typeof parsed === 'object') {
            return callback(null, parsed);
          }
        } catch (_) {}

        // Check for multipart form-data
        const cType = req.headers['content-type'] || '';
        if (cType.includes('multipart/form-data')) {
          const match = cType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
          const boundary = match ? (match[1] || match[2]).trim() : null;
          if (boundary) {
            const parts = body.split('--' + boundary);
            for (const part of parts) {
              const nameMatch = part.match(/name="([^"]+)"/);
              if (nameMatch) {
                const fieldName = nameMatch[1];
                const headerEnd = part.indexOf('\r\n\r\n');
                if (headerEnd !== -1) {
                  let val = part.slice(headerEnd + 4);
                  if (val.endsWith('\r\n')) val = val.slice(0, -2);
                  result[fieldName] = val;
                }
              }
            }
            return callback(null, result);
          }
        }

        // URL encoded fallback
        try {
          const params = new URLSearchParams(body);
          for (const [k, v] of params.entries()) {
            result[k] = v;
          }
        } catch (_) {}

        return callback(null, result);
      });
    };

    // Keep multipart audio intact. The general form parser above is intended
    // for text fields and would corrupt binary audio if used for recordings.
    const readMultipartAudio = (callback) => {
      const chunks = [];
      let size = 0;
      const maxBytes = 50 * 1024 * 1024;
      req.on('data', chunk => {
        size += chunk.length;
        if (size > maxBytes) {
          callback(new Error('Audio chunk exceeds the 50 MB limit'));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => {
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        const boundary = boundaryMatch && (boundaryMatch[1] || boundaryMatch[2]).trim();
        if (!boundary) return callback(new Error('Missing multipart boundary'));

        const body = Buffer.concat(chunks);
        const marker = Buffer.from(`--${boundary}`);
        const fields = {};
        let cursor = 0;
        while ((cursor = body.indexOf(marker, cursor)) !== -1) {
          cursor += marker.length;
          if (body.slice(cursor, cursor + 2).equals(Buffer.from('--'))) break;
          if (body.slice(cursor, cursor + 2).equals(Buffer.from('\r\n'))) cursor += 2;
          const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), cursor);
          if (headerEnd === -1) break;
          const headers = body.slice(cursor, headerEnd).toString('utf8');
          const dataStart = headerEnd + 4;
          const nextBoundary = body.indexOf(Buffer.from(`\r\n--${boundary}`), dataStart);
          if (nextBoundary === -1) break;
          const nameMatch = headers.match(/\bname="([^"]+)"/i);
          const isFile = /\bfilename="[^"]*"/i.test(headers);
          if (nameMatch) {
            const name = nameMatch[1];
            const value = body.slice(dataStart, nextBoundary);
            fields[name] = isFile ? value : value.toString('utf8');
          }
          cursor = nextBoundary + 2;
        }
        callback(null, fields);
      });
      req.on('error', callback);
    };

    // =========================================================================
    // 1. Root redirect: Always preserve /?source=pwa
    // =========================================================================
    if ((pathname === '/' || pathname === '') && (!parsedUrl.search || !parsedUrl.search.includes('source=pwa'))) {
      const redirectUrl = '/?source=pwa' + (parsedUrl.hash || '');
      res.writeHead(302, { 'Location': redirectUrl, 'Cache-Control': 'no-store' });
      return res.end();
    }

    // API and browser routes overlap (for example /patients and /sessions).
    // Browser reloads must receive the SPA document; XHR/fetch requests keep
    // reaching the JSON handlers below.
    if (acceptsHtmlDocument && !pathname.startsWith('/itaca-assets/')) {
      const indexPath = path.join(__dirname, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        return fs.createReadStream(indexPath).pipe(res);
      }
    }

    // =========================================================================
    // 2. Account & Capabilities API
    // =========================================================================
    if (pathname === '/account' && method === 'GET') {
      return jsonResponse(200, {
        uuid: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
        user: {
          uuid: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          email: "medicazo@notiuxmedica.com",
          display_name: "Medicazo",
          display_first_name: "Medicazo",
          display_initials: "M",
          profile: {
            first_name: "Medicazo",
            last_name: "",
            full_name: "Medicazo",
            display_first_name: "Medicazo",
            display_initials: "M"
          },
          role: "md",
          survey_role: "md",
          locale: "es",
          timezone: "America/Mexico_City",
          organization_uuid: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          internal: false
        },
        organization: {
          uuid: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          organization_type: "practice",
          membership_role: "org_admin",
          display_name: "Medicazo",
          profile: {
            name: "Medicazo",
            country_code: "MX",
            currency: "MXN",
            timezone: "America/Mexico_City",
            logo_url: null
          },
          active_members_count: 1,
          invited_count: (db.invites || []).length
        },
        capabilities: {
          has_active_organization_membership: true,
          can_manage_organization: true,
          can_view_organization: true,
          can_manage_invites: true,
          can_manage_subscription: true,
          can_create_clinical_data: true,
          can_manage_patients: true,
          can_view_clinical_data: true,
          can_view_clinical_measurements: true,
          can_use_clinical_evidence: true,
          can_use_clinical_cases: true,
          can_manage_note_templates: true,
          can_create_note_templates: true,
          can_manage_note_rules: true,
          can_manage_org_calendar: true,
          can_view_assigned_calendar_events: true,
          can_assign_calendar_events: true,
          can_view_org_calendar: true,
          can_manage_operations: true,
          can_supervise: true,
          can_manage_public_page: true,
          can_manage_public_booking_requests: true,
          can_delete_clinical_data: true,
          can_exclude_clinical_sessions: true,
          can_merge_patients: true,
          can_import_patients: true,
          can_contact_patients: true,
          can_view_intake_submissions: true,
          can_view_logs: true,
          can_manage_intake_templates: true,
          has_org_plan_restriction: false
        },
        usage_stats: {
          sessions_count: db.sessions.length,
          queries_count: db.queries.length,
          deep_research_count: 0,
          cases_count: db.cases.length,
          has_shared_intake_requests: false,
          has_non_starter_questionnaires: false,
          has_published_public_page: false,
          has_draft_public_page: false
        },
        effective_plan_name: "pro",
        plan: {
          name: "pro",
          active: true
        },
        organization_settings: {
          email_mfa_required: false
        }
      });
    }

    // =========================================================================
    // 3. User Settings & Auth
    // =========================================================================
    if (pathname === '/user_settings') {
      if (method === 'PATCH' || method === 'POST') {
        return parseBody((err, data) => {
          const safeData = data || {};
          return jsonResponse(200, {
            user: {
              uuid: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
              locale: "es",
              timezone: "America/Mexico_City"
            },
            settings: safeData.settings || {}
          });
        });
      }
      return jsonResponse(200, {
        user: {
          uuid: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          locale: "es"
        },
        settings: {}
      });
    }

    if (pathname === '/users/token/refresh') {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiYTBlZWJjOTktOWMwYi00ZWY4LWJiNmQtNmJiOWJkMzgwYTExIiwiaW50ZXJuYWwiOmZhbHNlLCJzdWIiOiJhMGVlYmM5OS05YzBiLTRlZjgtYmI2ZC02YmI5YmQzODBhMTEiLCJlbWFpbCI6Im1lZGljYXpvQGl0YWNhLnBybyIsImV4cCI6MTk5OTk5OTk5OX0.mockSignature";
      return jsonResponse(200, { token });
    }

    // =========================================================================
    // 4. Team / Organization Members & Invites API
    // =========================================================================
    const orgMembers = [
      {
        id: 1,
        user: {
          uuid: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          first_name: "Medicazo",
          last_name: "",
          email: "medicazo@notiuxmedica.com"
        },
        org_role: "org_admin",
        status: "active",
        specialty: "Medicina General",
        can_supervise: true
      }
    ];

    if (pathname === '/organization_members' && method === 'GET') {
      return jsonResponse(200, { members: orgMembers });
    }

    if (pathname.startsWith('/organization_members/')) {
      return jsonResponse(200, { member: orgMembers[0] });
    }

    if (pathname === '/organization_invites') {
      if (method === 'GET') {
        return jsonResponse(200, { invites: db.invites || [] });
      }
      if (method === 'POST') {
        return parseBody((err, data) => {
          const safe = data || {};
          const newInvite = {
            id: Date.now(),
            email: safe.email || safe['invite[email]'] || 'colega@clinica.com',
            org_role: safe.org_role || 'org_clinician',
            status: 'pending',
            created_at: new Date().toISOString()
          };
          if (!db.invites) db.invites = [];
          db.invites.unshift(newInvite);
          saveDb();
          return jsonResponse(200, { invite: newInvite, invites: db.invites });
        });
      }
    }

    if (pathname === '/users' && (req.headers['accept']?.includes('application/json') || method !== 'GET')) {
      return jsonResponse(200, {
        users: [{
          uuid: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          first_name: "Medicazo",
          last_name: "",
          email: "medicazo@notiuxmedica.com",
          role: "md"
        }],
        members: orgMembers
      });
    }

    // =========================================================================
    // 5. Subscription & Note Types
    // =========================================================================
    if (pathname === '/billing/current_subscription' && method === 'GET') {
      return jsonResponse(200, {
        plan_name: "pro",
        billing_period: "monthly",
        status: "active",
        next_billing_date: "2027-01-01",
        cancel_at_period_end: false
      });
    }

    if (pathname.startsWith('/note_types/') && method === 'GET') {
      const slug = pathname.replace('/note_types/', '').split('/')[0];
      if (slug === 'recommended') {
        return jsonResponse(200, {
          recommended: [
            { id: "soap", name: "Nota SOAP", kind: "system", description: "Subjetivo, Objetivo, Análisis, Plan" },
            { id: "first_visit", name: "Primera visita", kind: "system", description: "Historia clínica completa inicial" },
            { id: "follow_up", name: "Consulta de seguimiento", kind: "system", description: "Evolución y ajuste terapéutico" }
          ]
        });
      }
      const preview = getNoteTypeMarkdownPreview(slug);
      return jsonResponse(200, {
        slug: slug,
        name: getNoteTypeName(slug),
        markdown_preview: preview,
        markdownPreview: preview
      });
    }

    if (pathname === '/calendars' && method === 'GET') {
      return jsonResponse(200, []);
    }

    // =========================================================================
    // 6. Patients & Intake API
    // =========================================================================
    if (pathname === '/patients/tags' && method === 'GET') {
      return jsonResponse(200, {
        tags: ["Hipertensión", "Diabetes Tipo 2", "Cardiología", "Pediatría", "Control", "Nuevo"]
      });
    }

    if (pathname === '/patients/search' && method === 'GET') {
      const term = String(parsedUrl.query?.term || '').trim().toLocaleLowerCase('es-MX');
      const patients = term.length < 2 ? [] : db.patients.filter(patient => {
        const searchable = [patient.full_name, patient.name, patient.first_name, patient.last_name, patient.email]
          .filter(Boolean).join(' ').toLocaleLowerCase('es-MX');
        return searchable.includes(term);
      }).slice(0, 20);
      return jsonResponse(200, { patients });
    }

    const defaultIntakeTemplate = {
      uuid: "tmpl-general-01",
      id: "tmpl-general-01",
      name: "Cuestionario general de salud",
      description: "Información general, antecedentes y motivo de consulta",
      template_type: "intake",
      system_key: "patient_invite",
      status: "published",
      build_state: "ready",
      starter: true,
      created_at: new Date().toISOString()
    };

    if (pathname === '/patients/invite_options' && method === 'GET') {
      return jsonResponse(200, {
        selected_template: defaultIntakeTemplate,
        requires_default_selection: false,
        eligible_templates: [defaultIntakeTemplate],
        using_system_default: true
      });
    }

    if (pathname === '/patients/invite' && method === 'POST') {
      return parseBody((err, data) => {
        const safe = data || {};
        const patientUuid = safe.patient_uuid || safe['patient_uuid'];
        const targetPatient = db.patients.find(p => p.uuid === patientUuid || p.id === patientUuid) || db.patients[0] || {};
        const reqId = 'ir-' + Date.now();
        const intakeReq = {
          uuid: reqId,
          id: reqId,
          patient_uuid: targetPatient.uuid || targetPatient.id,
          patient: targetPatient,
          request_status: "shared",
          link: `/intake/${reqId}`,
          intake_template: defaultIntakeTemplate,
          created_at: new Date().toISOString()
        };
        if (!Array.isArray(db.intake_requests)) db.intake_requests = [];
        db.intake_requests.unshift(intakeReq);
        saveDb();
        return jsonResponse(200, {
          patient: targetPatient,
          intake_request: intakeReq
        });
      });
    }

    if (pathname === '/intake_templates' || pathname === '/intake_templates/') {
      return jsonResponse(200, {
        intake_templates: [defaultIntakeTemplate]
      });
    }

    if (pathname === '/intake_requests' || pathname === '/intake_requests/') {
      if (method === 'GET') {
        const patientUuid = parsedUrl.query?.patient_uuid;
        const requests = Array.isArray(db.intake_requests) ? db.intake_requests : [];
        const filtered = patientUuid ? requests.filter(r => r.patient_uuid === patientUuid || r.patient?.uuid === patientUuid) : requests;
        return jsonResponse(200, {
          intake_requests: filtered
        });
      }
      if (method === 'POST') {
        return parseBody((err, data) => {
          const safe = data || {};
          const patientUuid = safe.patient_uuid;
          const targetPatient = db.patients.find(p => p.uuid === patientUuid || p.id === patientUuid) || db.patients[0] || {};
          const reqId = 'ir-' + Date.now();
          const intakeReq = {
            uuid: reqId,
            id: reqId,
            patient_uuid: targetPatient.uuid || targetPatient.id,
            patient: targetPatient,
            request_status: "shared",
            link: `/intake/${reqId}`,
            intake_template: defaultIntakeTemplate,
            created_at: new Date().toISOString()
          };
          if (!Array.isArray(db.intake_requests)) db.intake_requests = [];
          db.intake_requests.unshift(intakeReq);
          saveDb();
          return jsonResponse(200, {
            intake_request: intakeReq
          });
        });
      }
    }

    if (pathname.startsWith('/intake_requests/') && pathname.endsWith('/revoke') && method === 'POST') {
      const parts = pathname.split('/');
      const reqId = parts[2];
      const req = (db.intake_requests || []).find(r => r.uuid === reqId) || { uuid: reqId, request_status: "discarded" };
      req.request_status = "discarded";
      saveDb();
      return jsonResponse(200, { intake_request: req });
    }

    if (pathname.startsWith('/intake_requests/') && pathname.endsWith('/share') && method === 'POST') {
      const parts = pathname.split('/');
      const reqId = parts[2];
      const req = (db.intake_requests || []).find(r => r.uuid === reqId) || { uuid: reqId, request_status: "shared", link: `/intake/${reqId}` };
      req.request_status = "shared";
      saveDb();
      return jsonResponse(200, { intake_request: req });
    }

    if (pathname === '/intake_submissions' || pathname === '/intake_submissions/') {
      return jsonResponse(200, {
        intake_requests: []
      });
    }

    if (pathname === '/calendar_events' || pathname === '/calendar_events/') {
      return jsonResponse(200, {
        calendar_events: [],
        meta: makeMeta(0)
      });
    }

    if (pathname === '/user_survey') {
      if (method === 'PUT' || method === 'POST') {
        return parseBody((err, data) => {
          const safe = data || {};
          db.user_survey = { ...(db.user_survey || {}), ...(safe.user_survey || safe) };
          saveDb();
          return jsonResponse(200, {
            success: true,
            user_survey: db.user_survey
          });
        });
      }
      return jsonResponse(200, {
        user_survey: db.user_survey || {}
      });
    }

    if (pathname.includes('/clinical_measurements') && method === 'GET') {
      return jsonResponse(200, {
        measurements: [],
        clinical_measurements: []
      });
    }

    if (pathname === '/patients' || pathname === '/patients/') {
      if (method === 'GET') {
        const { records, meta } = getPage(db.patients, parsedUrl.query?.page, 20, { tags: parsedUrl.query?.['tags[]'] || parsedUrl.query?.tags });
        return jsonResponse(200, {
          patients: records.map(normalizePatient),
          meta
        });
      }
      if (method === 'POST') {
        return parseBody((err, data) => {
          const safe = data || {};
          const pData = (safe && typeof safe.patient === 'object' && safe.patient !== null) ? safe.patient : safe;
          const id = 'p-' + Date.now();

          let fullName = String(pData.full_name || pData.name || safe.full_name || safe.name || '').trim();
          let firstName = String(pData.first_name || safe.first_name || safe['patient[first_name]'] || '').trim();
          let lastName = String(pData.last_name || safe.last_name || safe['patient[last_name]'] || '').trim();

          if (!fullName && (firstName || lastName)) {
            fullName = `${firstName} ${lastName}`.trim();
          } else if (fullName && (!firstName && !lastName)) {
            const parts = fullName.split(/\s+/);
            firstName = parts[0] || 'Nuevo';
            lastName = parts.slice(1).join(' ') || '';
          }

          if (!fullName) {
            firstName = 'Nuevo';
            lastName = 'Paciente';
            fullName = 'Nuevo Paciente';
          }

          const mobileNumber = String(pData.mobile_number || pData.mobile || pData.phone || safe.mobile_number || safe.phone || '').trim();
          const newPatient = {
            uuid: id,
            id: id,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            name: fullName,
            dob: pData.dob || safe.dob || safe['patient[dob]'] || "1985-01-01",
            gender: pData.gender || safe.gender || safe['patient[gender]'] || "unspecified",
            phone: mobileNumber,
            mobile_number: mobileNumber,
            email: pData.email || safe.email || safe['patient[email]'] || "",
            national_id: pData.national_id || safe.national_id || "",
            age: pData.age ? String(pData.age) : "",
            location: pData.location || safe.location || "Consultorio",
            tags: Array.isArray(pData.tags) ? pData.tags : (pData.tags ? [pData.tags] : (Array.isArray(safe.tags) ? safe.tags : ["Control"])),
            coverage_name: pData.coverage_name || safe.coverage_name || "Particular",
            coverage_member_id: pData.coverage_member_id || safe.coverage_member_id || "",
            emergency_contact_name: pData.emergency_contact_name || safe.emergency_contact_name || "",
            emergency_contact_phone: pData.emergency_contact_phone || safe.emergency_contact_phone || "",
            comments: pData.comments || safe.comments || "",
            civil_status: pData.civil_status || safe.civil_status || "",
            occupation: pData.occupation || safe.occupation || "",
            religion: pData.religion || safe.religion || "",
            weight: pData.weight || safe.weight || "",
            height: pData.height || safe.height || "",
            blood_type: pData.blood_type || safe.blood_type || "",
            bmi: pData.bmi || safe.bmi || "",
            completed_sessions_count: 0,
            completed_calls_count: 0,
            completed_documents_count: 0,
            completed_questionnaires_count: 0,
            created_at: new Date().toISOString(),
            items: [
              {
                id: 'med-' + id,
                name: 'metoclopramida',
                dosage: '10mg',
                presentation: '10mg',
                frequency: 'c/12h',
                instructions: '10 mg • Tomar cada 12 horas',
                status: 'ongoing',
                stopped_at: null
              }
            ]
          };
          db.patients.unshift(newPatient);
          saveDb();
          const norm = normalizePatient(newPatient);
          return jsonResponse(200, { patient: norm, ...norm });
        });
      }
    }

    // Specific handler for PATCH /patients/:id/medications
    if (pathname.startsWith('/patients/') && pathname.includes('/medications') && method === 'PATCH') {
      const pid = pathname.replace('/patients/', '').split('/')[0];
      return parseBody((err, data) => {
        const safe = data || {};
        const newItems = Array.isArray(safe.items) ? safe.items : [];
        let patient = db.patients.find(p => p.uuid === pid || p.id === pid);
        if (patient) {
          patient.items = newItems;
          saveDb();
          const norm = normalizePatient(patient);
          return jsonResponse(200, norm);
        }
        return jsonResponse(404, { error: 'Patient not found' });
      });
    }

    if (pathname.startsWith('/patients/') && method === 'PATCH' && !pathname.includes('/medications')) {
      const pid = pathname.replace('/patients/', '').split('/')[0];
      return parseBody((err, data) => {
        const safe = data || {};
        const pData = (safe && typeof safe.patient === 'object' && safe.patient !== null) ? safe.patient : safe;
        const idx = db.patients.findIndex(p => p.uuid === pid || p.id === pid);
        if (idx !== -1) {
          const current = db.patients[idx];
          let fullName = String(pData.full_name || pData.name || current.full_name || current.name || '').trim();
          let firstName = String(pData.first_name || current.first_name || '').trim();
          let lastName = String(pData.last_name || current.last_name || '').trim();
          if (pData.full_name && !pData.first_name) {
            const parts = fullName.split(/\s+/);
            firstName = parts[0] || firstName;
            lastName = parts.slice(1).join(' ') || lastName;
          }
          const updated = {
            ...current,
            ...pData,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            name: fullName,
            phone: pData.mobile_number !== undefined ? pData.mobile_number : (pData.phone !== undefined ? pData.phone : current.phone),
            mobile_number: pData.mobile_number !== undefined ? pData.mobile_number : (pData.phone !== undefined ? pData.phone : current.mobile_number),
            email: pData.email !== undefined ? pData.email : current.email
          };
          db.patients[idx] = updated;
          saveDb();
          const norm = normalizePatient(updated);
          return jsonResponse(200, { patient: norm, ...norm });
        }
        return jsonResponse(404, { error: 'Patient not found' });
      });
    }

    if (pathname.startsWith('/patients/') && method === 'GET') {
      const pid = pathname.replace('/patients/', '').split('/')[0];
      if (['tags', 'search', 'invite_options', 'invite', 'merge', 'search_duplicates'].includes(pid)) {
        return jsonResponse(404, { error: 'Not found' });
      }
      let patient = db.patients.find(p => p.uuid === pid || p.id === pid);
      if (!patient) {
        patient = db.patients[0];
      }
      const norm = normalizePatient(patient);
      return jsonResponse(200, { patient: norm, ...norm });
    }

    // =========================================================================
    // 7. Sessions / Visitas API
    // =========================================================================
    if (pathname === '/sessions/clinical_tags' && method === 'GET') {
      return jsonResponse(200, {
        clinical_tags: ["Medicina General", "Diabetes", "Hipertensión", "Cardiología", "Control", "Consulta Externa"]
      });
    }

    if (pathname === '/sessions' || pathname === '/sessions/') {
      if (method === 'GET') {
        const { records, meta } = getPage(db.sessions, parsedUrl.query?.page, 10, {
          tags: parsedUrl.query?.['tags[]'] || parsedUrl.query?.tags,
          patient_uuid: parsedUrl.query?.patient_uuid || parsedUrl.query?.patient_id
        });
        return jsonResponse(200, {
          sessions: records.map(normalizeSession),
          meta
        });
      }
      if (method === 'POST') {
        return parseBody(async (err, data) => {
          const safe = data || {};
          // A recording session must be created before audio capture starts.
          // Note generation happens after recording is completed and must not
          // prevent the microphone workflow from starting when AI is offline.
          const isRecordingStart = Boolean(safe.device_info || safe.recording_origin || safe.recording_profile || safe.mobile_app_recording_id);
          if (isRecordingStart) {
            const sid = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
            const patient = db.patients.find(p => p.uuid === safe.patient_uuid || p.id === safe.patient_uuid) || null;
            const newSession = {
              uuid: sid,
              id: sid,
              title: 'Grabación en curso',
              gen_title: 'Grabación en curso',
              status: 'in_progress',
              recording_status: 'in_progress',
              started_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              mode: safe.mode || 'recording',
              recording_origin: safe.recording_origin || null,
              recording_profile: safe.recording_profile || null,
              mobile_app_recording_id: safe.mobile_app_recording_id || null,
              patient_id: patient?.uuid || null,
              patient,
              calendar_event_uuid: safe.calendar_event_uuid || null,
              received_partials_count: 0,
              doctor_notes: [],
              notes: [],
              audio_chunks: []
            };
            db.sessions.unshift(newSession);
            saveDb();
            return jsonResponse(200, newSession);
          }

          const sid = 'sess-' + Date.now();
          const noteId = 'note-' + Date.now();
          const noteType = safe.note_type_slug || safe['session[note_type_slug]'] || "soap";
          const inputObservations = safe.observations || safe.transcript || safe.title || safe['session[observations]'] || "Consulta médica general";

          const aiGenerated = await generateWithAI(
            `Genera una nota médica estructurada en formato SOAP para un expediente clínico profesional, basada en las siguientes observaciones del médico:\n"${inputObservations}"\n\nEstructura la nota con secciones claras en Markdown: ### Subjetivo (S), ### Objetivo (O), ### Análisis (A), ### Plan (P) con recomendaciones y fármacos si aplican.`,
            "Eres el motor clínico de IA de Notiux Médica para profesionales de la salud. Genera notas clínicas de alta calidad, precisas, sobrias y en español."
          );

          if (!aiGenerated) {
            return jsonResponse(503, { error: 'El servicio de IA no respondió. No se creó la nota; inténtelo de nuevo.' });
          }

          const targetPatient = db.patients.find(p => p.uuid === safe.patient_id) || db.patients[0];
          const newSession = {
            uuid: sid,
            id: sid,
            title: safe.title || safe['session[title]'] || "Consulta clínica estructurada",
            gen_title: safe.title || safe['session[title]'] || "Consulta clínica estructurada",
            gen_summary: "Nota generada con asistencia de IA; requiere revisión y aprobación del profesional.",
            status: "finalized",
            created_at: new Date().toISOString(),
            clinical_tags: ["Medicina General", "Consulta Externa"],
            patient_id: targetPatient?.uuid,
            patient: targetPatient,
            doctor_notes: [
              {
                uuid: noteId,
                note_type_slug: noteType,
                gen_title: "Nota SOAP - " + new Date().toLocaleDateString('es-MX'),
                gen_body: aiGenerated,
                gen_summary: "Nota generada con asistencia de IA; requiere revisión y aprobación del profesional.",
                gen_tags: ["Consulta Externa", "Medicina General"],
                gen_medications: [],
                completed: true
              }
            ],
            ai_status: 'generated',
            requires_professional_review: true
          };
          newSession.notes = newSession.doctor_notes;

          db.sessions.unshift(newSession);
          saveDb();
          return jsonResponse(200, newSession);
        });
      }
    }

    if (pathname.startsWith('/sessions/')) {
      const sid = pathname.replace('/sessions/', '').split('/')[0];
      const sessionIndex = db.sessions.findIndex(s => s.uuid === sid || s.id === sid);
      const storedSession = sessionIndex >= 0 ? db.sessions[sessionIndex] : null;

      if (pathname === `/sessions/${sid}/upload_partial` && method === 'POST') {
        if (!storedSession) return jsonResponse(404, { error: 'Recording session not found' });
        return readMultipartAudio((err, fields) => {
          if (err) return jsonResponse(err.message.includes('50 MB') ? 413 : 400, { error: err.message });
          const audio = fields.audio;
          const chunkIndex = Number.parseInt(fields.index, 10);
          if (!Buffer.isBuffer(audio) || audio.length === 0 || !Number.isInteger(chunkIndex) || chunkIndex < 0) {
            return jsonResponse(400, { error: 'Audio chunk and valid index are required' });
          }
          try {
            const recordingDir = path.join(__dirname, 'recordings', sid);
            fs.mkdirSync(recordingDir, { recursive: true });
            const chunkPath = path.join(recordingDir, `${chunkIndex}.audio`);
            fs.writeFileSync(chunkPath, audio);
            const chunks = Array.isArray(storedSession.audio_chunks) ? storedSession.audio_chunks : [];
            const existing = chunks.findIndex(chunk => chunk.index === chunkIndex);
            const chunkInfo = { index: chunkIndex, size: audio.length, path: path.relative(__dirname, chunkPath) };
            if (existing >= 0) chunks[existing] = chunkInfo;
            else chunks.push(chunkInfo);
            storedSession.audio_chunks = chunks.sort((a, b) => a.index - b.index);
            storedSession.received_partials_count = storedSession.audio_chunks.length;
            saveDb();
            return jsonResponse(200, { received: true, index: chunkIndex, received_partials_count: storedSession.received_partials_count });
          } catch (writeError) {
            console.error('[AUDIO SAVE ERROR]:', writeError);
            return jsonResponse(500, { error: 'Could not save the audio chunk locally' });
          }
        });
      }

      if (pathname === `/sessions/${sid}/complete` && method === 'PATCH') {
        if (!storedSession) return jsonResponse(404, { error: 'Recording session not found' });
        return parseBody(async (err, data) => {
          storedSession.recording_status = 'completed';
          storedSession.completed_at = new Date().toISOString();
          storedSession.reported_partials_count = Number.parseInt(data?.reported_partials_count, 10) || storedSession.received_partials_count || 0;
          if (data?.patient_uuid) {
            const patient = db.patients.find(p => p.uuid === data.patient_uuid || p.id === data.patient_uuid);
            if (patient) { storedSession.patient = patient; storedSession.patient_id = patient.uuid; }
          }
          if (data?.user_notes) {
            storedSession.user_notes = data.user_notes;
          }

          // Generate default note if none exists so session never gets stuck
          if (!Array.isArray(storedSession.doctor_notes) || storedSession.doctor_notes.length === 0) {
            let patient = storedSession.patient;
            if (!patient && storedSession.patient_id) {
              patient = db.patients.find(p => p.uuid === storedSession.patient_id || p.id === storedSession.patient_id);
            }
            if (!patient && db.patients.length > 0) patient = db.patients[0];

            const generated = await buildClinicalNoteForSession({
              session: storedSession,
              patient,
              slug: 'general_soap',
              userNotes: storedSession.user_notes || '',
              generateWithAI
            });

            const noteId = 'note-' + Date.now();
            const doctorNote = {
              uuid: noteId,
              id: noteId,
              note_type_slug: 'general_soap',
              default_title: generated.title,
              gen_title: generated.title,
              gen_body: generated.body,
              gen_summary: generated.summary,
              gen_tags: ["Medicina General", "Consulta Externa"],
              gen_medications: generated.medications || [],
              gen_inconsistencies: [],
              completed: true,
              created_at: new Date().toISOString(),
              completed_at: new Date().toISOString()
            };

            const pinId = 'pin-' + Date.now();
            const instructionNote = {
              uuid: pinId,
              id: pinId,
              note_type_slug: 'patient_instructions',
              default_title: 'Instrucciones para paciente',
              gen_title: 'Instrucciones para paciente',
              gen_body: generated.instructions,
              gen_summary: generated.summary,
              completed: true,
              created_at: new Date().toISOString(),
              completed_at: new Date().toISOString()
            };

            storedSession.status = 'finalized';
            storedSession.ai_status = 'generated';
            storedSession.title = generated.title;
            storedSession.gen_title = generated.title;
            storedSession.gen_summary = generated.summary;
            storedSession.clinical_tags = ["Medicina General", "Consulta Externa"];
            storedSession.doctor_notes = [doctorNote];
            storedSession.notes = [doctorNote];
            storedSession.patient_instruction_notes = [instructionNote];

            if (patient) {
              storedSession.patient = patient;
              storedSession.patient_id = patient.uuid || patient.id;
              patient.summary = generated.summary;
              patient.summary_generated_at = new Date().toISOString();
              patient.completed_sessions_count = Math.max(patient.completed_sessions_count || 0, 1);
            }
          } else {
            storedSession.status = 'finalized';
          }

          saveDb();
          return jsonResponse(200, normalizeSession(storedSession));
        });
      }

      if (pathname === `/sessions/${sid}/create_note` && method === 'POST') {
        if (!storedSession) return jsonResponse(404, { error: 'Recording session not found' });
        return parseBody(async (err, data) => {
          const noteTypeSlug = data?.note_type_slug || 'general_soap';
          let patient = storedSession.patient;
          if (!patient && storedSession.patient_id) {
            patient = db.patients.find(p => p.uuid === storedSession.patient_id || p.id === storedSession.patient_id);
          }
          if (!patient && db.patients.length > 0) patient = db.patients[0];

          const generated = await buildClinicalNoteForSession({
            session: storedSession,
            patient,
            slug: noteTypeSlug,
            userNotes: storedSession.user_notes || data?.user_notes || '',
            generateWithAI
          });

          const noteId = 'note-' + Date.now();
          const doctorNote = {
            uuid: noteId,
            id: noteId,
            note_type_slug: noteTypeSlug,
            default_title: generated.title,
            gen_title: generated.title,
            gen_body: generated.body,
            gen_summary: generated.summary,
            gen_tags: ["Medicina General", "Consulta Externa"],
            gen_medications: generated.medications || [],
            gen_inconsistencies: [],
            completed: true,
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          };

          const pinId = 'pin-' + Date.now();
          const instructionNote = {
            uuid: pinId,
            id: pinId,
            note_type_slug: 'patient_instructions',
            default_title: 'Instrucciones para paciente',
            gen_title: 'Instrucciones para paciente',
            gen_body: generated.instructions,
            gen_summary: generated.summary,
            completed: true,
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          };

          storedSession.status = 'finalized';
          storedSession.recording_status = 'completed';
          storedSession.ai_status = 'generated';
          storedSession.title = generated.title;
          storedSession.gen_title = generated.title;
          storedSession.gen_summary = generated.summary;
          storedSession.clinical_tags = ["Medicina General", "Consulta Externa"];
          storedSession.doctor_notes = [doctorNote];
          storedSession.notes = [doctorNote];
          storedSession.patient_instruction_notes = [instructionNote];
          storedSession.completed_at = storedSession.completed_at || new Date().toISOString();

          if (patient) {
            storedSession.patient = patient;
            storedSession.patient_id = patient.uuid || patient.id;
            patient.summary = generated.summary;
            patient.summary_generated_at = new Date().toISOString();
            patient.completed_sessions_count = Math.max(patient.completed_sessions_count || 0, 1);
          }

          saveDb();
          return jsonResponse(200, normalizeSession(storedSession));
        });
      }

      if (pathname === `/sessions/${sid}/update_visit` && (method === 'PATCH' || method === 'POST')) {
        if (!storedSession) return jsonResponse(404, { error: 'Recording session not found' });
        return parseBody((err, data) => {
          if (data?.title) {
            storedSession.title = data.title;
            storedSession.gen_title = data.title;
            if (storedSession.doctor_notes?.[0]) storedSession.doctor_notes[0].gen_title = data.title;
          }
          if (data?.patient_uuid) {
            const p = db.patients.find(pt => pt.uuid === data.patient_uuid || pt.id === data.patient_uuid);
            if (p) {
              storedSession.patient = p;
              storedSession.patient_id = p.uuid;
            }
          }
          saveDb();
          return jsonResponse(200, normalizeSession(storedSession));
        });
      }

      if (pathname === `/sessions/${sid}` && method === 'DELETE') {
        if (!storedSession) return jsonResponse(404, { error: 'Session not found' });
        db.sessions = db.sessions.filter(s => s.uuid !== sid && s.id !== sid);
        saveDb();
        return jsonResponse(200, { success: true });
      }

      if (pathname === `/sessions/${sid}/pause` && method === 'PATCH' || pathname === `/sessions/${sid}/resume` && method === 'PATCH') {
        if (!storedSession) return jsonResponse(404, { error: 'Recording session not found' });
        storedSession.recording_status = pathname.endsWith('/pause') ? 'paused' : 'in_progress';
        saveDb();
        return jsonResponse(200, normalizeSession(storedSession));
      }

      if (!storedSession) return jsonResponse(404, { error: 'Session not found' });
      const session = normalizeSession(storedSession);
      if (method === 'PATCH') {
        return parseBody((err, data) => {
          const updates = data?.session || data || {};
          if (updates.title) {
            storedSession.title = updates.title;
            storedSession.gen_title = updates.title;
          }
          if (updates.patient_uuid) {
            const p = db.patients.find(pt => pt.uuid === updates.patient_uuid || pt.id === updates.patient_uuid);
            if (p) {
              storedSession.patient = p;
              storedSession.patient_id = p.uuid;
            }
          }
          if (Array.isArray(updates.doctor_notes)) {
            storedSession.doctor_notes = updates.doctor_notes;
            storedSession.notes = updates.doctor_notes;
          }
          saveDb();
          return jsonResponse(200, normalizeSession(storedSession));
        });
      }
      return jsonResponse(200, session || {});
    }

    // =========================================================================
    // 8. Cases / Diagnóstico Diferencial API
    // =========================================================================
    if (pathname === '/cases/tags' && method === 'GET') {
      return jsonResponse(200, {
        gen_tags: ["Cardiología", "Neurología", "Medicina Interna", "Pediatría", "Urgencias", "Cefaleas", "Diagnóstico Diferencial"]
      });
    }

    if (pathname === '/cases/create_demo' && method === 'POST') {
      const demoId = 'c-demo-' + Date.now();
      const demoCase = {
        uuid: demoId,
        id: demoId,
        title: "Caso Clínico Demostrativo: Dolor torácico atípico en adulto joven",
        gen_title: "Caso Clínico Demostrativo: Dolor torácico atípico en adulto joven",
        summary: "Varón de 28 años con dolor punzante en hemitórax izquierdo que se modifica con los movimientos respiratorios.",
        gen_summary: "Varón de 28 años con dolor punzante en hemitórax izquierdo de 4 días de evolución que se intensifica en decúbito y mejora al inclinarse hacia adelante. Antecedente de cuadro viral respiratorio reciente.",
        gen_tags: ["Cardiología", "Urgencias", "Diagnóstico Diferencial"],
        text_entries: [
          {
            uuid: "te-demo-1",
            content: "Varón de 28 años, sin comorbilidades. Presenta dolor torácico pleurítico punzante de inicio súbito, irradiado a trapecio izquierdo. ECG muestra elevación difusa del segmento ST cóncava hacia arriba con descenso del PR en cara inferior.",
            completed: true,
            created_at: new Date().toISOString()
          }
        ],
        queries: [],
        files: [],
        differential_diagnoses: [
          { name: "Pericarditis aguda viral", probability: "Alta", reasoning: "Dolor pleurítico posicional, frote pericárdico auscultable y cambios electrocardiográficos clásicos (elevación cóncava difusa del ST con depresión del PR)." },
          { name: "Costocondritis / Síndrome de Tietze", probability: "Moderada", reasoning: "Dolor reproducible a la palpación de cartílagos costales, pero no justifica las alteraciones del ECG." },
          { name: "Síndrome coronario agudo (SCA)", probability: "Baja", reasoning: "Bajo riesgo cardiovascular basal y ausencia de cambios segmentarios con onda Q en el trazado." }
        ],
        gen_considerations: [
          "Ecocardiograma transtorácico para descartar derrame pericárdico hemodinámicamente significativo.",
          "Biomarcadores cardíacos (Troponina I/T ultrasensible) y reactantes de fase aguda (PCR, VSG).",
          "Tratamiento antiinflamatorio de primera línea con AINEs a dosis plenas + Colchicina."
        ],
        gen_inquiry_prompts: [
          "¿Se ausculta frote pericárdico en borde esternal izquierdo?",
          "¿Existen biomarcadores de necrosis miocárdica elevados (miopericarditis)?"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.cases.unshift(demoCase);
      saveDb();
      return jsonResponse(200, { uuid: demoId, case: demoCase });
    }

    if (pathname === '/cases' || pathname === '/cases/') {
      if (method === 'GET') {
        const { records, meta } = getPage(db.cases, parsedUrl.query?.page, 20, { tags: parsedUrl.query?.['tags[]'] || parsedUrl.query?.tags });
        return jsonResponse(200, {
          cases: records,
          meta
        });
      }
      if (method === 'POST') {
        return parseBody(async (err, data) => {
          const safe = data || {};
          const cid = 'case-' + Date.now();
          const caseTitle = safe.title || safe['case[title]'] || safe.gen_title || "Caso Clínico para Razonamiento Diagnóstico";
          const caseSummary = safe.summary || safe['case[summary]'] || safe.text || safe.content || "Paciente que acude a valoración por cuadro clínico en estudio.";

          let diffDiagnoses = [];

          // Generate clinical differential diagnoses using Gemini AI
          const aiDiff = await generateWithAI(
            `Analiza el siguiente caso clínico y proporciona exclusivamente un array JSON con 3 diagnósticos diferenciales. Cada objeto debe tener 'name', 'probability' (Alta, Moderada o Baja), y 'reasoning'. No incluyas tratamiento ni datos inventados.\n\nCaso: ${caseTitle}\nResumen / Síntomas: ${caseSummary}`,
            "Eres un asistente de apoyo al razonamiento clínico. Devuelve únicamente JSON válido, no sustituyas el juicio del profesional y declara incertidumbre."
          );

          if (!aiDiff) {
            return jsonResponse(503, { error: 'El servicio de IA no respondió. No se generó el diagnóstico diferencial; inténtelo de nuevo.' });
          }
          try {
            const cleaned = aiDiff.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some(item => !item?.name || !item?.reasoning)) throw new Error('Formato de diagnósticos no válido');
            diffDiagnoses = parsed;
          } catch (_) {
            return jsonResponse(502, { error: 'La respuesta de IA no llegó en el formato esperado. No se guardó el caso.' });
          }

          const newCase = {
            uuid: cid,
            id: cid,
            title: caseTitle,
            gen_title: caseTitle,
            summary: caseSummary,
            gen_summary: caseSummary,
            gen_tags: ["Medicina Interna", "Diagnóstico Diferencial"],
            text_entries: [
              {
                uuid: "te-" + Date.now(),
                content: caseSummary,
                completed: true,
                created_at: new Date().toISOString()
              }
            ],
            queries: [],
            files: [],
            differential_diagnoses: diffDiagnoses,
            gen_considerations: [],
            gen_inquiry_prompts: [],
            ai_status: 'generated',
            requires_professional_review: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          db.cases.unshift(newCase);
          saveDb();
          return jsonResponse(200, newCase);
        });
      }
    }

    if (pathname.startsWith('/cases/')) {
      const cid = pathname.replace('/cases/', '').split('/')[0];
      if (method === 'DELETE') {
        db.cases = db.cases.filter(c => c.uuid !== cid && c.id !== cid);
        saveDb();
        return jsonResponse(200, { success: true });
      }
      const foundCase = db.cases.find(c => c.uuid === cid || c.id === cid) || db.cases[0];
      return jsonResponse(200, foundCase || {});
    }

    // =========================================================================
    // 9. Queries / Evidencia Clínica & Deep Research API
    // =========================================================================
    if (pathname === '/queries' || pathname === '/queries/') {
      if (method === 'GET') {
        const { records, meta } = getPage(db.queries, parsedUrl.query?.page, 20);
        return jsonResponse(200, {
          queries: records,
          meta
        });
      }
      if (method === 'POST') {
        return parseBody(async (err, data) => {
          const safe = data || {};
          const qid = 'query-' + Date.now();
          const question = safe.question || safe['query[question]'] || safe.q || "¿Pregunta clínica?";
          const isDeep = safe.deep_research === 'true' || safe['query[deep_research]'] === 'true' || false;

          const aiAnswer = await generateWithAI(
            `Pregunta médica de profesional de la salud: "${question}"\n${isDeep ? 'Realiza un análisis exhaustivo modo Deep Research. Identifica límites de evidencia e incertidumbre.' : 'Proporciona una respuesta clínica concisa, rigurosa, estructurada y basada en evidencia.'}\n\nNo inventes estudios, autores, revistas, fechas ni DOI. Si no puedes verificar una fuente, indícalo explícitamente.`,
            "Eres un asistente de apoyo para profesionales de la salud. Responde en español, con rigor, incertidumbre explícita y sin sustituir el juicio clínico."
          );

          if (!aiAnswer) {
            return jsonResponse(503, { error: 'El servicio de IA no respondió. No se guardó la respuesta; inténtelo de nuevo.' });
          }

          const newQuery = {
            uuid: qid,
            id: qid,
            question: question,
            gen_answer: aiAnswer,
            gen_answer_body: aiAnswer,
            completed: true,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            published_at: new Date().toISOString(),
            share_token: 'share-' + qid,
            slug: 'q-' + qid,
            gen_citations: [],
            citations_verified: false,
            gen_related_questions: [],
            ai_status: 'generated',
            requires_professional_review: true,
            deep_research: isDeep
          };

          db.queries.unshift(newQuery);
          saveDb();
          return jsonResponse(200, newQuery);
        });
      }
    }

    if (pathname.startsWith('/queries/') && method === 'GET') {
      const qid = pathname.replace('/queries/', '').split('/')[0];
      const queryItem = db.queries.find(q => q.uuid === qid || q.id === qid) || db.queries[0];
      return jsonResponse(200, queryItem || {});
    }

    // =========================================================================
    // 10. Documents API (Recetas, Órdenes, Documentos Clínicos)
    // =========================================================================
    if (pathname === '/documents' || pathname === '/documents/') {
      if (method === 'GET') {
        const patientUuid = parsedUrl.query?.patient_uuid;
        let docs = (db.documents || []).map(normalizeDocument);
        if (patientUuid) {
          docs = docs.filter(d => d.patient_uuid === patientUuid || d.patient_id === patientUuid || d.patient?.uuid === patientUuid);
        }
        const { records, meta } = getPage(docs, parsedUrl.query?.page, 20);
        return jsonResponse(200, {
          documents: records,
          meta
        });
      }
      if (method === 'POST') {
        return parseBody((err, data) => {
          const safe = data || {};
          const isPrescription = safe.doc_type === 'prescription' || safe.document_type === 'prescription';
          const isDiagnosticOrder = safe.doc_type === 'diagnostic_order' || safe.document_type === 'diagnostic_order';
          const docId = safe.uuid || ('doc-' + Date.now());
          const rxId = 'rx-' + Date.now();
          const pUuid = safe.patient_uuid || safe.patient_id;
          let targetPatient = db.patients.find(p => p.uuid === pUuid || p.id === pUuid) || db.patients[0];

          let prescriptionLines = [];
          if (isPrescription) {
            const rawMeds = safe.structured_details?.medications || [];
            if (rawMeds.length > 0) {
              prescriptionLines = rawMeds.map((m, idx) => ({
                position: idx + 1,
                name: m.name || '',
                dose: m.dosage || m.dose || m.presentation || '',
                presentation: m.dosage || m.dose || m.presentation || '',
                instructions: m.instructions || m.frequency || '',
                duration: m.duration || '',
                dispense_quantity: m.dispense_quantity || ''
              }));
            } else if (safe.details) {
              prescriptionLines.push({
                position: 1,
                name: safe.details,
                dose: '',
                presentation: '',
                instructions: '',
                duration: '',
                dispense_quantity: ''
              });
            } else if (targetPatient.items && targetPatient.items.length > 0) {
              prescriptionLines = targetPatient.items.map((m, idx) => ({
                position: idx + 1,
                name: m.name || '',
                dose: m.dosage || m.dose || m.presentation || '',
                presentation: m.dosage || m.dose || m.presentation || '',
                instructions: m.instructions || m.frequency || '',
                duration: m.duration || '',
                dispense_quantity: m.dispense_quantity || ''
              }));
            }

            // Ensure patient has these in saved medications
            if (prescriptionLines.length > 0 && targetPatient) {
              if (!targetPatient.items) targetPatient.items = [];
              const currentNames = new Set(targetPatient.items.map(i => (i.name || '').toLowerCase()));
              for (const line of prescriptionLines) {
                if (line.name && !currentNames.has(line.name.toLowerCase())) {
                  targetPatient.items.push({
                    id: 'med-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                    name: line.name,
                    dosage: line.dose || line.presentation || '',
                    presentation: line.presentation || line.dose || '',
                    instructions: line.instructions,
                    frequency: line.instructions,
                    status: 'ongoing',
                    stopped_at: null
                  });
                }
              }
            }
          }

          let diagOrder = null;
          if (isDiagnosticOrder) {
            const orderItems = [];
            const orderGroups = [];
            let currentPos = 1;

            const selectedPkgUuids = Array.isArray(safe.order_package_uuids) ? safe.order_package_uuids : [];
            const exclusions = safe.order_package_item_exclusions || {};

            for (const pkgUuid of selectedPkgUuids) {
              const pkg = (db.order_packages || []).find(p => p.uuid === pkgUuid || p.id === pkgUuid);
              if (!pkg) continue;
              const pkgExclusions = exclusions[pkgUuid] || [];
              const groupPositions = [];
              const items = (pkg.order_package_items || []).filter(item => !pkgExclusions.includes(item.uuid));
              for (const it of items) {
                orderItems.push({
                  uuid: it.uuid || ('item-' + currentPos),
                  position: currentPos,
                  code: it.code || '',
                  name: it.name || '',
                  indications: it.indications || ''
                });
                groupPositions.push(currentPos);
                currentPos++;
              }
              if (groupPositions.length > 0) {
                orderGroups.push({
                  title: pkg.name,
                  item_positions: groupPositions,
                  instructions: pkg.instructions ? [pkg.instructions] : [],
                  source_metadata: { source: 'order_package', package_uuid: pkg.uuid }
                });
              }
            }

            if (safe.details && typeof safe.details === 'string' && safe.details.trim()) {
              const lines = safe.details.split('\n').map(l => l.trim()).filter(Boolean);
              const customPositions = [];
              for (const line of lines) {
                let name = line;
                let indications = '';
                if (line.includes(':')) {
                  const parts = line.split(':');
                  name = parts[0].trim();
                  indications = parts.slice(1).join(':').trim();
                } else if (line.includes(' - ')) {
                  const parts = line.split(' - ');
                  name = parts[0].trim();
                  indications = parts.slice(1).join(' - ').trim();
                }
                orderItems.push({
                  uuid: 'custom-' + currentPos,
                  position: currentPos,
                  code: '',
                  name,
                  indications
                });
                customPositions.push(currentPos);
                currentPos++;
              }
              if (customPositions.length > 0) {
                orderGroups.push({
                  title: 'Estudios específicos',
                  item_positions: customPositions,
                  instructions: [],
                  source_metadata: { source: 'custom' }
                });
              }
            }

            diagOrder = {
              uuid: 'diag-' + Date.now(),
              id: 'diag-' + Date.now(),
              order_items: orderItems,
              order_groups: orderGroups,
              general_instructions: [
                "Presentarse en ayuno según las especificaciones de cada estudio.",
                "Informar al personal de laboratorio si consume medicamentos de manera crónica o anticoagulantes.",
                "Acudir con ropa cómoda y sin objetos metálicos en caso de estudios de imagen."
              ]
            };
          }

          const rawDoc = {
            uuid: docId,
            id: docId,
            doc_type: isPrescription ? 'prescription' : (isDiagnosticOrder ? 'diagnostic_order' : (safe.doc_type || 'clinical_summary')),
            document_type: isPrescription ? 'prescription' : (isDiagnosticOrder ? 'diagnostic_order' : (safe.document_type || 'clinical_summary')),
            gen_title: isPrescription ? 'Receta médica' : (isDiagnosticOrder ? 'Orden de estudios' : (safe.title || safe['document[title]'] || "Documento Clínico")),
            title: isPrescription ? 'Receta médica' : (isDiagnosticOrder ? 'Orden de estudios' : (safe.title || safe['document[title]'] || "Documento Clínico")),
            content: safe.content || safe.details || (isDiagnosticOrder ? "Orden de estudios de diagnóstico generada." : "Contenido del documento generado."),
            user_body: safe.content || safe.details || "",
            gen_body: safe.content || safe.details || "",
            completed: true,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            patient_uuid: targetPatient?.uuid,
            patient_id: targetPatient?.uuid,
            patient: targetPatient ? {
              ...targetPatient,
              full_name: targetPatient.full_name || targetPatient.name,
              fullName: targetPatient.full_name || targetPatient.name,
              mobile_number: targetPatient.mobile_number || targetPatient.phone,
              mobileNumber: targetPatient.mobile_number || targetPatient.phone,
              email: targetPatient.email || ''
            } : null,
            language: safe.language || 'es',
            details: safe.details || '',
            order_package_uuids: safe.order_package_uuids || [],
            order_package_item_exclusions: safe.order_package_item_exclusions || {},
            prescription: isPrescription ? {
              uuid: rxId,
              id: rxId,
              prescription_lines: prescriptionLines,
              general_instructions: [
                "Siga exactamente las indicaciones del profesional tratante.",
                "No suspenda ni modifique el tratamiento sin indicación médica."
              ]
            } : null,
            diagnostic_order: isDiagnosticOrder ? diagOrder : null
          };

          const newDoc = normalizeDocument(rawDoc);
          if (!db.documents) db.documents = [];
          db.documents.unshift(newDoc);
          if (targetPatient) {
            targetPatient.completed_documents_count = (targetPatient.completed_documents_count || 0) + 1;
          }
          saveDb();
          return jsonResponse(200, newDoc);
        });
      }
    }

    if (pathname.startsWith('/documents/') && method === 'GET') {
      const docId = pathname.replace('/documents/', '').split('/')[0].split('?')[0];
      const doc = (db.documents || []).find(d => d.uuid === docId || d.id === docId);
      if (doc) {
        return jsonResponse(200, normalizeDocument(doc));
      }
      return jsonResponse(404, { error: 'Document not found' });
    }

    if (pathname.startsWith('/documents/') && method === 'DELETE') {
      const docId = pathname.replace('/documents/', '').split('/')[0].split('?')[0];
      db.documents = (db.documents || []).filter(d => d.uuid !== docId && d.id !== docId);
      saveDb();
      return jsonResponse(200, { success: true });
    }

    // =========================================================================
    // 10b. Order Packages API (Paquetes y Órdenes de estudios)
    // =========================================================================
    if (pathname === '/order_packages' || pathname === '/order_packages/') {
      if (method === 'GET') {
        return jsonResponse(200, {
          order_packages: db.order_packages || []
        });
      }
      if (method === 'POST') {
        return parseBody((err, data) => {
          const safe = data || {};
          const pkgData = safe.order_package || safe;
          const newPkg = {
            uuid: 'pkg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            id: 'pkg-' + Date.now(),
            name: pkgData.name || 'Nuevo paquete',
            instructions: pkgData.instructions || '',
            owner_uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            order_package_items: (pkgData.items || []).map((it, idx) => ({
              uuid: it.uuid || ('item-' + Date.now() + '-' + idx),
              position: idx + 1,
              code: it.code || '',
              name: it.name || '',
              indications: it.indications || ''
            }))
          };
          if (!db.order_packages) db.order_packages = [];
          db.order_packages.unshift(newPkg);
          saveDb();
          return jsonResponse(200, { ...newPkg, order_package: newPkg, data: newPkg });
        });
      }
    }

    if (pathname.startsWith('/order_packages/')) {
      const parts = pathname.replace('/order_packages/', '').split('/');
      const pkgId = parts[0].split('?')[0];
      const isCopy = parts[1] === 'copy';

      if (isCopy && method === 'POST') {
        return parseBody((err, data) => {
          const safe = data || {};
          const original = (db.order_packages || []).find(p => p.uuid === pkgId || p.id === pkgId);
          const override = safe.order_package || {};
          const newPkg = {
            uuid: 'pkg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            id: 'pkg-' + Date.now(),
            name: override.name || ((original?.name || 'Paquete') + ' (Copia)'),
            instructions: override.instructions !== undefined ? override.instructions : (original?.instructions || ''),
            owner_uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            order_package_items: (original?.order_package_items || []).map((it, idx) => ({
              ...it,
              uuid: 'item-' + Date.now() + '-' + idx
            }))
          };
          if (!db.order_packages) db.order_packages = [];
          db.order_packages.push(newPkg);
          saveDb();
          return jsonResponse(200, { ...newPkg, order_package: newPkg, data: newPkg });
        });
      }

      if (method === 'PATCH' || method === 'PUT') {
        return parseBody((err, data) => {
          const safe = data || {};
          const pkgData = safe.order_package || safe;
          const pkg = (db.order_packages || []).find(p => p.uuid === pkgId || p.id === pkgId);
          if (pkg) {
            if (pkgData.name !== undefined) pkg.name = pkgData.name;
            if (pkgData.instructions !== undefined) pkg.instructions = pkgData.instructions;
            if (Array.isArray(pkgData.items)) {
              pkg.order_package_items = pkgData.items.map((it, idx) => ({
                uuid: it.uuid || ('item-' + Date.now() + '-' + idx),
                position: idx + 1,
                code: it.code || '',
                name: it.name || '',
                indications: it.indications || ''
              }));
            }
            saveDb();
            return jsonResponse(200, { ...pkg, order_package: pkg, data: pkg });
          }
          return jsonResponse(404, { error: 'Package not found' });
        });
      }

      if (method === 'DELETE') {
        db.order_packages = (db.order_packages || []).filter(p => p.uuid !== pkgId && p.id !== pkgId);
        saveDb();
        return jsonResponse(200, { success: true });
      }

      if (method === 'GET') {
        const pkg = (db.order_packages || []).find(p => p.uuid === pkgId || p.id === pkgId);
        if (pkg) {
          return jsonResponse(200, { ...pkg, order_package: pkg, data: pkg });
        }
        return jsonResponse(404, { error: 'Package not found' });
      }
    }

    // =========================================================================
    // 11. Calls API (Llamadas)
    // =========================================================================
    if (pathname === '/calls' || pathname === '/calls/') {
      if (method === 'GET') {
        const { records, meta } = getPage(db.calls, parsedUrl.query?.page, 10);
        return jsonResponse(200, {
          calls: records,
          meta
        });
      }
      if (method === 'POST') {
        return parseBody((err, data) => {
          const safe = data || {};
          const callId = 'call-' + Date.now();
          const newCall = {
            uuid: callId,
            id: callId,
            to_number: safe.to_number || "+52 55 1234 5678",
            status: "completed",
            duration: 120,
            created_at: new Date().toISOString(),
            summary: "Llamada de seguimiento médico completada satisfactoriamente."
          };
          if (!db.calls) db.calls = [];
          db.calls.unshift(newCall);
          saveDb();
          return jsonResponse(200, newCall);
        });
      }
    }

    // =========================================================================
    // 12. PDF Report Direct Download
    // =========================================================================
    if (pathname === '/descargar-informe' || pathname === '/Informe_QA_Integracion_Itaca.pdf') {
      const pdfPath = path.join(__dirname, 'Informe_QA_Integracion_Itaca.pdf');
      if (fs.existsSync(pdfPath)) {
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Informe_QA_Integracion_Itaca.pdf"'
        });
        return fs.createReadStream(pdfPath).pipe(res);
      }
    }

    // =========================================================================
    // 13. Static Assets & SPA Client-side Routing Fallback
    // =========================================================================
    let safePath = pathname.replace(/\.\./g, '');
    if (safePath === '/' || safePath === '') {
      safePath = '/index.html';
    }

    let filePath = path.join(__dirname, safePath);

    // If file exists on disk, serve it with proper content-type
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      return fs.createReadStream(filePath).pipe(res);
    }

    // SPA fallback: return index.html for all non-API client routes
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(indexPath).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (err) {
    console.error('Request processing error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

function listen(port, attempts = 0) {
  server.once('error', error => {
    if (error.code === 'EADDRINUSE' && !PORT_WAS_EXPLICIT && attempts < 20) {
      console.warn(`[SERVER] El puerto ${port} ya está ocupado; probando ${Number(port) + 1}.`);
      return listen(Number(port) + 1, attempts + 1);
    }
    console.error('[SERVER START ERROR]:', error.message);
    process.exitCode = 1;
  });

  server.listen(port, HOST, () => {
    const appUrl = `http://localhost:${port}/?source=pwa`;
    console.log(`\n======================================================`);
    console.log(`  Notiux Médica - Asistente de IA para Profesionales de la Salud`);
    console.log(`  Servidor médico local activo en:`);
    console.log(`  ${appUrl}`);
    console.log(`  Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'}`);
    console.log(`======================================================\n`);

    if (process.env.OPEN_BROWSER === '1' && process.platform === 'win32') {
      const browser = spawn('cmd.exe', ['/c', 'start', '', appUrl], { detached: true, stdio: 'ignore', windowsHide: true });
      browser.unref();
    }
  });
}

if (require.main === module) {
  listen(PORT);
}

module.exports = server;

