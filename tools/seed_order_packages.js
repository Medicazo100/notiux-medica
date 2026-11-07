const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'mock_db.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

const ownerUuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

const packages = [
  {
    uuid: "pkg-preoperatorio",
    id: "pkg-preoperatorio",
    name: "Preoperatorio básico",
    instructions: "Ayuno de 8 a 12 horas. Acudir con ropa cómoda.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-pre-1", position: 1, code: "", name: "Biometría hemática completa", indications: "" },
      { uuid: "item-pre-2", position: 2, code: "", name: "Química sanguínea (Glucosa, Urea, Creatinina)", indications: "Ayuno de 8 a 12 horas" },
      { uuid: "item-pre-3", position: 3, code: "", name: "Tiempos de coagulación (TP, TTP, INR)", indications: "Informar uso de anticoagulantes" },
      { uuid: "item-pre-4", position: 4, code: "", name: "Examen general de orina (EGO)", indications: "Primera orina de la mañana" },
      { uuid: "item-pre-5", position: 5, code: "", name: "Grupo sanguíneo y factor Rh", indications: "" },
      { uuid: "item-pre-6", position: 6, code: "", name: "Electrocardiograma en reposo", indications: "Acudir con ropa cómoda de dos piezas" },
      { uuid: "item-pre-7", position: 7, code: "", name: "Telerradiografía de tórax (PA)", indications: "Sin objetos metálicos" }
    ]
  },
  {
    uuid: "pkg-prenatal",
    id: "pkg-prenatal",
    name: "Laboratorios prenatales iniciales",
    instructions: "Ayuno de 8 a 10 horas. Muestra de orina con aseo previo.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-pna-1", position: 1, code: "", name: "Biometría hemática completa", indications: "" },
      { uuid: "item-pna-2", position: 2, code: "", name: "Grupo sanguíneo y factor Rh", indications: "" },
      { uuid: "item-pna-3", position: 3, code: "", name: "Glucosa en ayuno", indications: "Ayuno de 8 a 10 horas" },
      { uuid: "item-pna-4", position: 4, code: "", name: "Examen general de orina y Urocultivo", indications: "Muestra de chorro medio, previo aseo" },
      { uuid: "item-pna-5", position: 5, code: "", name: "VDRL / RPR (Sífilis)", indications: "" },
      { uuid: "item-pna-6", position: 6, code: "", name: "Prueba rápida combinada VIH (Ag p24 / Ac)", indications: "" },
      { uuid: "item-pna-7", position: 7, code: "", name: "Anticuerpos contra Rubéola IgG/IgM", indications: "" },
      { uuid: "item-pna-8", position: 8, code: "", name: "Antígeno de superficie Hepatitis B (HBsAg)", indications: "" }
    ]
  },
  {
    uuid: "pkg-its",
    id: "pkg-its",
    name: "Tamizaje básico de ITS",
    instructions: "Sin aseo genital excesivo antes de la toma de muestras locales.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-its-1", position: 1, code: "", name: "VDRL / RPR (Sífilis)", indications: "" },
      { uuid: "item-its-2", position: 2, code: "", name: "Prueba combinada VIH (Ag p24 + Ac 1/2)", indications: "" },
      { uuid: "item-its-3", position: 3, code: "", name: "Serología Hepatitis B (HBsAg, Anti-HBc)", indications: "" },
      { uuid: "item-its-4", position: 4, code: "", name: "Serología Hepatitis C (Anti-HCV)", indications: "" },
      { uuid: "item-its-5", position: 5, code: "", name: "PCR Chlamydia trachomatis / Neisseria gonorrhoeae", indications: "No haber orinado 2 horas antes de la toma" }
    ]
  },
  {
    uuid: "pkg-anemia",
    id: "pkg-anemia",
    name: "Anemia / fatiga básico",
    instructions: "Ayuno de 8 horas; muestra matutina para cinética de hierro",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-ane-1", position: 1, code: "", name: "Biometría hemática", indications: "" },
      { uuid: "item-ane-2", position: 2, code: "", name: "Ferritina", indications: "" },
      { uuid: "item-ane-3", position: 3, code: "", name: "Hierro/TIBC o saturación de transferrina", indications: "Ayuno de 8 horas; muestra matutina" },
      { uuid: "item-ane-4", position: 4, code: "", name: "Vitamina B12", indications: "" },
      { uuid: "item-ane-5", position: 5, code: "", name: "Folato", indications: "" }
    ]
  },
  {
    uuid: "pkg-tiroides",
    id: "pkg-tiroides",
    name: "Tiroides básico",
    instructions: "Muestra matutina en ayuno. No tomar levotiroxina previo a la extracción.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-tir-1", position: 1, code: "", name: "TSH ultrasensible", indications: "Muestra matutina en ayuno" },
      { uuid: "item-tir-2", position: 2, code: "", name: "T4 Libre", indications: "" },
      { uuid: "item-tir-3", position: 3, code: "", name: "T3 Total", indications: "" },
      { uuid: "item-tir-4", position: 4, code: "", name: "T3 Libre", indications: "" },
      { uuid: "item-tir-5", position: 5, code: "", name: "Anticuerpos anti-TPO", indications: "" }
    ]
  },
  {
    uuid: "pkg-hepatica",
    id: "pkg-hepatica",
    name: "Evaluación hepática",
    instructions: "Informar uso de anticoagulantes o fármacos hepatotóxicos",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-hep-1", position: 1, code: "", name: "AST", indications: "" },
      { uuid: "item-hep-2", position: 2, code: "", name: "ALT", indications: "" },
      { uuid: "item-hep-3", position: 3, code: "", name: "Fosfatasa alcalina", indications: "" },
      { uuid: "item-hep-4", position: 4, code: "", name: "Bilirrubina", indications: "" },
      { uuid: "item-hep-5", position: 5, code: "", name: "Albúmina", indications: "" },
      { uuid: "item-hep-6", position: 6, code: "", name: "TP/INR", indications: "Informar uso de anticoagulantes" }
    ]
  },
  {
    uuid: "pkg-renal",
    id: "pkg-renal",
    name: "Evaluación renal",
    instructions: "Muestra de orina matutina o recolección de 24 horas según indicación.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-ren-1", position: 1, code: "", name: "Química sanguínea (Urea, BUN, Creatinina, Ácido úrico)", indications: "Ayuno de 8 horas" },
      { uuid: "item-ren-2", position: 2, code: "", name: "Electrólitos séricos (Sodio, Potasio, Cloro)", indications: "" },
      { uuid: "item-ren-3", position: 3, code: "", name: "Relación albúmina / creatinina en orina (RAC)", indications: "Primera orina de la mañana" },
      { uuid: "item-ren-4", position: 4, code: "", name: "Examen general de orina (EGO)", indications: "Muestra matutina" },
      { uuid: "item-ren-5", position: 5, code: "", name: "Depuración de creatinina en orina de 24 horas", indications: "Recolectar orina durante 24 horas continuas" },
      { uuid: "item-ren-6", position: 6, code: "", name: "Ultrasonido renal y vías urinarias", indications: "Vejiga llena, beber 1 L de agua 1 h antes" }
    ]
  },
  {
    uuid: "pkg-diabetes",
    id: "pkg-diabetes",
    name: "Seguimiento de diabetes",
    instructions: "Ayuno de 8 a 12 horas para glucosa y lípidos. No suspender medicación habitual salvo indicación.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-dia-1", position: 1, code: "", name: "Hemoglobina glucosilada (HbA1c)", indications: "No requiere ayuno estricto" },
      { uuid: "item-dia-2", position: 2, code: "", name: "Glucosa sérica en ayuno", indications: "Ayuno de 8 a 12 horas" },
      { uuid: "item-dia-3", position: 3, code: "", name: "Perfil de lípidos completo", indications: "Ayuno estricto de 12 horas" },
      { uuid: "item-dia-4", position: 4, code: "", name: "Creatinina sérica y TFGe", indications: "" },
      { uuid: "item-dia-5", position: 5, code: "", name: "Microalbuminuria en muestra matutina", indications: "Primera orina de la mañana" },
      { uuid: "item-dia-6", position: 6, code: "", name: "Insulina basal", indications: "Muestra en ayuno estricto" }
    ]
  },
  {
    uuid: "pkg-perfil-lipidico",
    id: "pkg-perfil-lipidico",
    name: "Perfil lipídico / Cardiovascular",
    instructions: "Ayuno estricto de 12 horas. Evitar consumo de alcohol 24 horas antes.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-lip-1", position: 1, code: "", name: "Colesterol total", indications: "" },
      { uuid: "item-lip-2", position: 2, code: "", name: "Colesterol HDL", indications: "" },
      { uuid: "item-lip-3", position: 3, code: "", name: "Colesterol LDL", indications: "" },
      { uuid: "item-lip-4", position: 4, code: "", name: "Colesterol VLDL", indications: "" },
      { uuid: "item-lip-5", position: 5, code: "", name: "Triglicéridos", indications: "Ayuno estricto de 12 horas" },
      { uuid: "item-lip-6", position: 6, code: "", name: "Proteína C reactiva ultrasensible (PCR-us)", indications: "" },
      { uuid: "item-lip-7", position: 7, code: "", name: "Apolipoproteína B (ApoB)", indications: "" }
    ]
  },
  {
    uuid: "pkg-checkup-general",
    id: "pkg-checkup-general",
    name: "Check-up general preventivo",
    instructions: "Ayuno de 8 a 12 horas. Muestra de orina matutina.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-chk-1", position: 1, code: "", name: "Biometría hemática completa", indications: "" },
      { uuid: "item-chk-2", position: 2, code: "", name: "Química sanguínea integral", indications: "Ayuno de 8 a 12 horas" },
      { uuid: "item-chk-3", position: 3, code: "", name: "Perfil de lípidos", indications: "Ayuno de 12 horas" },
      { uuid: "item-chk-4", position: 4, code: "", name: "Examen general de orina (EGO)", indications: "Primera orina de la mañana" },
      { uuid: "item-chk-5", position: 5, code: "", name: "Perfil tiroideo básico (TSH, T4L)", indications: "" },
      { uuid: "item-chk-6", position: 6, code: "", name: "Sangre oculta en heces (inmunológica)", indications: "Sin restricciones dietéticas previas" },
      { uuid: "item-chk-7", position: 7, code: "", name: "Radiografía de tórax (PA)", indications: "Sin accesorios metálicos" }
    ]
  },
  {
    uuid: "pkg-gastrointestinal",
    id: "pkg-gastrointestinal",
    name: "Gastrointestinal / Abdominal",
    instructions: "Ayuno de 8 horas para ultrasonido.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-gas-1", position: 1, code: "", name: "Coproparasitoscópico en serie de 3", indications: "3 muestras en días consecutivos" },
      { uuid: "item-gas-2", position: 2, code: "", name: "Coprológico general", indications: "Muestra fresca" },
      { uuid: "item-gas-3", position: 3, code: "", name: "Amilasa y Lipasa séricas", indications: "" },
      { uuid: "item-gas-4", position: 4, code: "", name: "Antígeno Helicobacter pylori en heces", indications: "" },
      { uuid: "item-gas-5", position: 5, code: "", name: "Ultrasonido de abdomen superior", indications: "Ayuno completo de 8 horas" }
    ]
  },
  {
    uuid: "pkg-reumatologico",
    id: "pkg-reumatologico",
    name: "Reumatológico / Autoinmune básico",
    instructions: "Ayuno de 8 horas. No requiere suspensión de analgésicos habituales.",
    owner_uuid: ownerUuid,
    order_package_items: [
      { uuid: "item-reu-1", position: 1, code: "", name: "Factor reumatoide cuantitativo", indications: "" },
      { uuid: "item-reu-2", position: 2, code: "", name: "Anticuerpos antinucleares (ANA) por IFI", indications: "" },
      { uuid: "item-reu-3", position: 3, code: "", name: "Velocidad de sedimentación globular (VSG)", indications: "" },
      { uuid: "item-reu-4", position: 4, code: "", name: "Proteína C reactiva (PCR)", indications: "" },
      { uuid: "item-reu-5", position: 5, code: "", name: "Ácido úrico sérico", indications: "" },
      { uuid: "item-reu-6", position: 6, code: "", name: "Anticuerpos anti-CCP", indications: "" }
    ]
  }
];

db.order_packages = packages;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.log('Seeded', packages.length, 'order_packages successfully in mock_db.json');
