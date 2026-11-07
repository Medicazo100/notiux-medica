const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'mock_db.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

const pedro = (db.patients || []).find(p => (p.name || p.full_name || '').toLowerCase().includes('pedro'));
if (!pedro) {
  console.error('Pedro not found!');
  process.exit(1);
}

const diagDoc = {
  uuid: "doc-diag-pedro-01",
  id: "doc-diag-pedro-01",
  doc_type: "diagnostic_order",
  document_type: "diagnostic_order",
  gen_title: "Orden de estudios",
  title: "Orden de estudios",
  completed: true,
  completed_at: "2026-11-04T12:00:00.000Z",
  created_at: "2026-11-04T12:00:00.000Z",
  patient_uuid: pedro.uuid,
  patient_id: pedro.uuid,
  patient: {
    ...pedro,
    full_name: pedro.full_name || pedro.name,
    fullName: pedro.full_name || pedro.name,
    mobile_number: pedro.mobile_number || pedro.phone,
    mobileNumber: pedro.mobile_number || pedro.phone,
    email: pedro.email || ''
  },
  language: "es",
  order_package_uuids: ["pkg-hepatica", "pkg-anemia"],
  order_package_item_exclusions: {},
  diagnostic_order: {
    uuid: "diag-sample-01",
    id: "diag-sample-01",
    order_items: [
      { position: 1, code: "", name: "AST", indications: "" },
      { position: 2, code: "", name: "ALT", indications: "" },
      { position: 3, code: "", name: "Fosfatasa alcalina", indications: "" },
      { position: 4, code: "", name: "Bilirrubina", indications: "" },
      { position: 5, code: "", name: "Albúmina", indications: "" },
      { position: 6, code: "", name: "TP/INR", indications: "Informar uso de anticoagulantes" },
      { position: 7, code: "", name: "Biometría hemática", indications: "" },
      { position: 8, code: "", name: "Ferritina", indications: "" },
      { position: 9, code: "", name: "Hierro/TIBC o saturación de transferrina", indications: "Ayuno de 8 horas; muestra matutina" },
      { position: 10, code: "", name: "Vitamina B12", indications: "" },
      { position: 11, code: "", name: "Folato", indications: "" }
    ],
    order_groups: [
      {
        title: "Evaluación hepática",
        item_positions: [1, 2, 3, 4, 5, 6],
        instructions: [],
        source_metadata: { source: "order_package", package_uuid: "pkg-hepatica" }
      },
      {
        title: "Anemia / fatiga básico",
        item_positions: [7, 8, 9, 10, 11],
        instructions: [],
        source_metadata: { source: "order_package", package_uuid: "pkg-anemia" }
      }
    ],
    general_instructions: [
      "Presentarse en ayuno mínimo de 8 horas para toma de muestras séricas.",
      "Informar al laboratorio si consume medicamentos anticoagulantes.",
      "Entregar esta orden en la recepción del laboratorio clínico."
    ]
  }
};

// Check if already in db.documents
if (!db.documents) db.documents = [];
const existingIdx = db.documents.findIndex(d => d.uuid === diagDoc.uuid);
if (existingIdx >= 0) {
  db.documents[existingIdx] = diagDoc;
} else {
  db.documents.unshift(diagDoc);
}

pedro.completed_documents_count = db.documents.filter(d => d.patient_uuid === pedro.uuid).length;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.log('Seeded sample diagnostic order for Pedro Suarez in mock_db.json');
