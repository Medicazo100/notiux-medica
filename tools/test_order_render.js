const Y = Object.freeze({ GROUP_HEADER: 'group_header', GROUP_INSTRUCTION: 'group_instruction', SPACER: 'spacer' });

function en(e) {
  let t = [e.code?.trim?.() || '', e.name?.trim?.() || ''].filter(Boolean).join(' - ');
  return { ...e, position: e.position, orderNameText: t, indicationsText: e.indications || '' };
}

function tn(e, t = []) {
  let n = new Map(e.map(e => [Number(e.position), e]));
  return t.forEach(e => {
    let t = e.item_positions || [],
        r = e.source_metadata?.source;
    t.forEach((i, a) => {
      let o = n.get(Number(i));
      o && (
        o.grouped = !0,
        o.groupSource = r,
        o.groupRowIndex = a,
        o.groupRowCount = t.length,
        a === 0 && (o.groupTitle = e.title || ''),
        a === t.length - 1 && (o.groupInstructions = e.instructions || [])
      );
    });
  }), e;
}

function nn(e) {
  return e.groupSource === 'order_package' && e.groupRowIndex === e.groupRowCount - 1;
}

function rn(e) {
  return e.flatMap((t, n) => {
    let r = [],
        i = ! !e[n + 1];
    return t.groupTitle && r.push({ kind: Y.GROUP_HEADER, position: `${t.position}-group-header`, groupTitle: t.groupTitle, keepWithNext: !0 }),
           r.push({ ...t, groupTitle: void 0, groupInstructions: void 0 }),
           (t.groupInstructions || []).forEach((e, n) => {
             r.push({ kind: Y.GROUP_INSTRUCTION, position: `${t.position}-group-instruction-${n}`, instruction: e });
           }),
           nn(t) && i && r.push({ kind: Y.SPACER, position: `${t.position}-package-spacer` }),
           r;
  });
}

// Mock diagnostic_order matching our logic
const diagnosticOrder = {
  order_items: [
    { position: 1, code: '', name: 'AST', indications: '' },
    { position: 2, code: '', name: 'ALT', indications: '' },
    { position: 3, code: '', name: 'Fosfatasa alcalina', indications: '' },
    { position: 4, code: '', name: 'Bilirrubina', indications: '' },
    { position: 5, code: '', name: 'Albúmina', indications: '' },
    { position: 6, code: '', name: 'TP/INR', indications: 'Informar uso de anticoagulantes' },
    { position: 7, code: '', name: 'Biometría hemática', indications: '' },
    { position: 8, code: '', name: 'Ferritina', indications: '' },
    { position: 9, code: '', name: 'Hierro/TIBC o saturación de transferrina', indications: 'Ayuno de 8 horas; muestra matutina' },
    { position: 10, code: '', name: 'Vitamina B12', indications: '' },
    { position: 11, code: '', name: 'Folato', indications: '' }
  ],
  order_groups: [
    {
      title: 'Evaluación hepática',
      item_positions: [1, 2, 3, 4, 5, 6],
      instructions: [],
      source_metadata: { source: 'order_package' }
    },
    {
      title: 'Anemia / fatiga básico',
      item_positions: [7, 8, 9, 10, 11],
      instructions: [],
      source_metadata: { source: 'order_package' }
    }
  ],
  general_instructions: []
};

const rows = rn(tn(diagnosticOrder.order_items.map(en), diagnosticOrder.order_groups));
console.log('Resulting Rows:');
rows.forEach((r, idx) => {
  if (r.kind === Y.GROUP_HEADER) {
    console.log(`[HEADER]: === ${r.groupTitle} ===`);
  } else if (r.kind === Y.SPACER) {
    console.log(`[SPACER]`);
  } else {
    console.log(`  Row ${r.position}: ${r.orderNameText} | ${r.indicationsText || '—'}`);
  }
});
