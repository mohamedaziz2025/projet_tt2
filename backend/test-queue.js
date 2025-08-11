const http = require('http');

console.log('=== Test de la route queue ===');
const queueRequest = http.get('http://localhost:5000/api/dashboard/queue', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response Body:', data);
    process.exit(0);
  });
});

queueRequest.on('error', (err) => {
  console.error('Request Error:', err.message);
  process.exit(1);
});
