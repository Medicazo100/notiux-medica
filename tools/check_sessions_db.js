const fs = require('fs');
const db = JSON.parse(fs.readFileSync('mock_db.json', 'utf8'));

console.log('Total sessions:', db.sessions?.length);
db.sessions?.forEach((s, idx) => {
  console.log(`\nSession ${idx + 1}:`);
  console.log('UUID:', s.uuid || s.id);
  console.log('Title:', s.title || s.gen_title);
  console.log('Status:', s.status, 'Recording status:', s.recording_status);
  console.log('Patient:', s.patient_id || s.patient?.name);
  console.log('Doctor notes count:', s.doctor_notes?.length);
  console.log('Notes count:', s.notes?.length);
  console.log('Audio chunks:', s.audio_chunks?.length);
  console.log('User notes / observations:', s.user_notes || s.observations);
});
