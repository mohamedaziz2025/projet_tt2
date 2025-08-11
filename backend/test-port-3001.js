const http = require('http');

async function testAllAPIs() {
  console.log('🧪 Test complet des APIs sur le port 3001...\n');
  
  const tests = [
    { name: 'Test Serveur', url: 'http://localhost:3001/api/test' },
    { name: 'Health Check', url: 'http://localhost:3001/api/dashboard/health' },
    { name: 'Stats Dashboard', url: 'http://localhost:3001/api/dashboard/stats' },
    { name: 'Queue Dashboard', url: 'http://localhost:3001/api/dashboard/queue' }
  ];
  
  for (const test of tests) {
    console.log(`🔍 ${test.name}...`);
    try {
      const result = await makeRequest(test.url);
      const data = JSON.parse(result.data);
      console.log(`✅ ${test.name} OK`);
      
      if (test.name === 'Stats Dashboard') {
        console.log(`   - Tickets: ${data.data?.tickets?.total || 0}`);
        console.log(`   - Agences: ${data.data?.agences?.total || 0}`);
        console.log(`   - Services: ${data.data?.services?.total || 0}`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name} FAILED:`, error.message);
    }
    console.log('');
  }
  
  console.log('🏁 Tests terminés !');
  process.exit(0);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve({ statusCode: response.statusCode, data });
        } else {
          reject(new Error(`Status ${response.statusCode}: ${data}`));
        }
      });
    });
    
    request.on('error', reject);
    request.setTimeout(5000, () => reject(new Error('Request timeout')));
  });
}

testAllAPIs();
