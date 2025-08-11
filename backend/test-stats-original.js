const http = require('http');

console.log('=== Test de la route stats originale ===');
const statsRequest = http.get('http://localhost:5000/api/dashboard/stats', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response Body:', data);
    process.exit(0);
  });
});

statsRequest.on('error', (err) => {
  console.error('Request Error:', err.message);
  process.exit(1);
});
