const fs = require('fs');
const db = JSON.parse(fs.readFileSync('mock_db.json', 'utf8'));

console.log('Keys in db:', Object.keys(db));
console.log('order_packages count:', (db.order_packages || []).length);
console.log('users:', db.users?.map(u => ({ uuid: u.uuid, name: u.name, email: u.email })));
