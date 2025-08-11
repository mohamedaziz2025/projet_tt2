const DashboardControllerDebug = require('./controllers/DashboardControllerDebug');

console.log('🧪 Test du contrôleur dashboard debug...');

// Mock response object
const mockRes = {
  json: (data) => {
    console.log('📊 STATS RESULT:');
    console.log(JSON.stringify(data, null, 2));
  }
};

// Test getStats
console.log('\n--- Test getStats ---');
DashboardControllerDebug.getStats({}, mockRes);

// Test getQueueData
console.log('\n--- Test getQueueData ---');
const mockRes2 = {
  json: (data) => {
    console.log('🎫 QUEUE RESULT:');
    console.log(JSON.stringify(data, null, 2));
  }
};

DashboardControllerDebug.getQueueData({}, mockRes2);
