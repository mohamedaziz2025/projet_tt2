const http = require('http');

// Test de la route health
console.log('=== Test Health Check ===');
const healthRequest = http.get('http://localhost:5000/api/dashboard/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Health Check Response:', data);
    
    // Test de la route stats-debug
    console.log('\n=== Test Stats Debug ===');
    const statsRequest = http.get('http://localhost:5000/api/dashboard/stats-debug', (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log('Stats Debug Response:', data2);
        process.exit(0);
      });
    });
    
    statsRequest.on('error', (err) => {
      console.error('Stats Debug Error:', err.message);
      process.exit(1);
    });
  });
});

healthRequest.on('error', (err) => {
  console.error('Health Check Error:', err.message);
  process.exit(1);
});
