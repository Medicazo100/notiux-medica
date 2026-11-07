const fs = require('fs');
const db = JSON.parse(fs.readFileSync('mock_db.json', 'utf8'));

console.log('Patients in db:', db.patients.map(p => ({ uuid: p.uuid, name: p.name || p.full_name })));
console.log('Documents in db:', db.documents.map(d => ({ uuid: d.uuid, title: d.gen_title || d.title, patient: d.patient_uuid })));

// If Pedro doesn't have an order of studies in documents, add one
const pedro = db.patients.find(p => (p.name || p.full_name || '').toLowerCase().includes('pedro'));
if (pedro && !db.documents.some(d => d.patient_uuid === pedro.uuid && (d.doc_type === 'diagnostic_order' || d.document_type === 'diagnostic_order'))) {
  db.documents.unshift({
    uuid: "doc-diag-pedro-01",
    id: "doc-diag-pedro-01",
    doc_type: "diagnostic_order",
    document_type: "diagnostic_order",
    gen_title: "Orden de estudios",
    title: "Orden de estudios",
    completed: true,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
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
  });
  pedro.completed_documents_count = db.documents.filter(d => d.patient_uuid === pedro.uuid).length;
  fs.writeFileSync('mock_db.json', JSON.stringify(db, null, 2));
  console.log('Added diagnostic order for Pedro Suarez to mock_db.json');
}
