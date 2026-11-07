async function run() {
  try {
    console.log('Testing GET /order_packages...');
    const res1 = await fetch('http://localhost:3000/order_packages');
    const data1 = await res1.json();
    console.log('GET /order_packages status:', res1.status, 'Count:', data1.order_packages?.length);
    console.log('First package:', data1.order_packages?.[0]?.name, 'Items:', data1.order_packages?.[0]?.order_package_items?.length);

    console.log('\nTesting POST /documents (diagnostic_order)...');
    const payload = {
      doc_type: "diagnostic_order",
      patient_uuid: "8435b424-f10f-4fef-8e82-ab0b4c20735a",
      order_package_uuids: ["pkg-hepatica", "pkg-anemia"],
      order_package_item_exclusions: {},
      language: "es"
    };
    const res2 = await fetch('http://localhost:3000/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data2 = await res2.json();
    console.log('POST /documents status:', res2.status, 'Title:', data2.gen_title, 'DocType:', data2.doc_type);
    console.log('Diagnostic Order items count:', data2.diagnostic_order?.order_items?.length);
    console.log('Groups count:', data2.diagnostic_order?.order_groups?.length);
    console.log('Group 1 title:', data2.diagnostic_order?.order_groups?.[0]?.title, 'Positions:', data2.diagnostic_order?.order_groups?.[0]?.item_positions);
    console.log('Group 2 title:', data2.diagnostic_order?.order_groups?.[1]?.title, 'Positions:', data2.diagnostic_order?.order_groups?.[1]?.item_positions);

    console.log('\nTesting GET /documents/' + data2.uuid);
    const res3 = await fetch('http://localhost:3000/documents/' + data2.uuid);
    const data3 = await res3.json();
    console.log('GET /documents/:id status:', res3.status, 'Title:', data3.gen_title);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

run();
