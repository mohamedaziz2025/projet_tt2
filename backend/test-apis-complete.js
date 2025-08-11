const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Couleurs pour l'affichage console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`)
};

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    log.info(`Test ${method} ${endpoint}...`);
    
    let response;
    switch (method) {
      case 'GET':
        response = await axios.get(`${BASE_URL}${endpoint}`);
        break;
      case 'POST':
        response = await axios.post(`${BASE_URL}${endpoint}`, data);
        break;
      case 'PUT':
        response = await axios.put(`${BASE_URL}${endpoint}`, data);
        break;
      default:
        throw new Error(`Méthode ${method} non supportée`);
    }
    
    log.success(`${endpoint} - Status: ${response.status}`);
    console.log(`📊 Données reçues:`, JSON.stringify(response.data, null, 2));
    return response.data;
    
  } catch (error) {
    log.error(`${endpoint} - ${error.response?.status || 'ERREUR'}: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function runCompleteTests() {
  console.log('\n🚀 Tests complets des APIs Dashboard\n');
  
  // Test 1: Health Check
  console.log('\n--- Test Health Check ---');
  await testAPI('/dashboard/health');
  
  // Test 2: Stats API
  console.log('\n--- Test Statistiques ---');
  const stats = await testAPI('/dashboard/stats');
  
  // Test 3: Queue API  
  console.log('\n--- Test File d\'attente ---');
  const queue = await testAPI('/dashboard/queue');
  
  // Test 4: Debug APIs
  console.log('\n--- Test APIs Debug ---');
  await testAPI('/dashboard/stats-debug');
  await testAPI('/dashboard/queue-debug');
  
  // Test 5: Agences API
  console.log('\n--- Test Agences ---');
  await testAPI('/agences');
  
  // Test 6: Services API
  console.log('\n--- Test Services ---');
  await testAPI('/services');
  
  // Test 7: Créer un ticket de test
  console.log('\n--- Test Création Ticket ---');
  const ticketData = {
    agence: 'Tunis Centre',
    service: 'Service Client',
    email: 'test@example.com'
  };
  const newTicket = await testAPI('/tickets', 'POST', ticketData);
  
  // Test 8: Lister tous les tickets
  console.log('\n--- Test Liste Tickets ---');
  await testAPI('/tickets');
  
  // Test 9: Mettre à jour statut ticket (si créé)
  if (newTicket && newTicket.success) {
    console.log('\n--- Test Mise à jour Statut ---');
    // Ce test nécessiterait l'ID du ticket créé
    log.info('Mise à jour de statut - nécessiterait implémentation côté backend');
  }
  
  console.log('\n🏁 Tests terminés!');
}

// Fonction pour tester spécifiquement les problèmes de données
async function testDataIssues() {
  console.log('\n🔍 Diagnostic des problèmes de données\n');
  
  try {
    // Vérifier les modèles de base
    log.info('Test des modèles de base de données...');
    
    const healthCheck = await testAPI('/dashboard/health');
    if (healthCheck) {
      console.log('📋 État des modèles:', healthCheck.models);
    }
    
    // Tester les compteurs
    log.info('Test des compteurs de tickets...');
    const stats = await testAPI('/dashboard/stats-debug');
    if (stats && stats.success) {
      const data = stats.data;
      console.log(`📊 Total tickets: ${data.tickets?.total || 0}`);
      console.log(`⏳ En attente: ${data.tickets?.enAttente || 0}`);
      console.log(`🔄 En cours: ${data.tickets?.enCours || 0}`);
      console.log(`✅ Terminés: ${data.tickets?.termines || 0}`);
    }
    
    // Tester la liste des tickets
    log.info('Test de la liste des tickets...');
    const queueData = await testAPI('/dashboard/queue-debug');
    if (queueData && queueData.success) {
      console.log(`🎫 Tickets trouvés: ${queueData.data.tickets?.length || 0}`);
      console.log(`🏢 Agences: ${queueData.data.agences?.length || 0}`);
      console.log(`🛎️ Services: ${queueData.data.services?.length || 0}`);
    }
    
  } catch (error) {
    log.error(`Erreur diagnostic: ${error.message}`);
  }
}

// Exécuter les tests
if (require.main === module) {
  console.log('🎯 Choix du test:');
  console.log('1. Tests complets (tapez: node test-apis-complete.js full)');
  console.log('2. Diagnostic rapide (tapez: node test-apis-complete.js diag)');
  
  const testType = process.argv[2];
  
  if (testType === 'full') {
    runCompleteTests();
  } else if (testType === 'diag') {
    testDataIssues();
  } else {
    console.log('\n🚀 Exécution du diagnostic rapide par défaut...\n');
    testDataIssues();
  }
}

module.exports = { testAPI, runCompleteTests, testDataIssues };
