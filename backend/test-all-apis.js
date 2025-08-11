const http = require('http');

async function testAPI() {
  console.log('🧪 Test complet de l\'API après migration...\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Test Health Check...');
  try {
    const healthResponse = await makeRequest('http://localhost:5000/api/dashboard/health');
    console.log('✅ Health Check OK:', JSON.parse(healthResponse.data).status);
  } catch (error) {
    console.log('❌ Health Check FAILED:', error.message);
  }
  
  // Test 2: Stats
  console.log('\n2️⃣ Test Stats...');
  try {
    const statsResponse = await makeRequest('http://localhost:5000/api/dashboard/stats');
    const stats = JSON.parse(statsResponse.data);
    console.log('✅ Stats OK - Tickets total:', stats.data.tickets.total);
    console.log('   - Agences actives:', stats.data.agences.total);
    console.log('   - Services actifs:', stats.data.services.total);
  } catch (error) {
    console.log('❌ Stats FAILED:', error.message);
  }
  
  // Test 3: Queue
  console.log('\n3️⃣ Test Queue...');
  try {
    const queueResponse = await makeRequest('http://localhost:5000/api/dashboard/queue');
    const queue = JSON.parse(queueResponse.data);
    console.log('✅ Queue OK - Tickets en file:', queue.data.tickets.length);
  } catch (error) {
    console.log('❌ Queue FAILED:', error.message);
  }
  
  // Test 4: Agences
  console.log('\n4️⃣ Test Agences...');
  try {
    const agencesResponse = await makeRequest('http://localhost:5000/api/agences');
    const agences = JSON.parse(agencesResponse.data);
    console.log('✅ Agences OK - Nombre:', agences.length || agences.data?.length || 'unknown');
  } catch (error) {
    console.log('❌ Agences FAILED:', error.message);
  }
  
  // Test 5: Services
  console.log('\n5️⃣ Test Services...');
  try {
    const servicesResponse = await makeRequest('http://localhost:5000/api/services');
    const services = JSON.parse(servicesResponse.data);
    console.log('✅ Services OK - Nombre:', services.length || services.data?.length || 'unknown');
  } catch (error) {
    console.log('❌ Services FAILED:', error.message);
  }
  
  console.log('\n🏁 Tests terminés !');
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

testAPI();
