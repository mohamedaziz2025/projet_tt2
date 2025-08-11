const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';

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
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`)
};

async function createTestTicket(agence, service, email) {
  try {
    log.info(`Création ticket: ${agence} - ${service}`);
    const response = await axios.post(`${BASE_URL}/tickets`, {
      agence,
      service, 
      email
    });
    
    if (response.data.success) {
      log.success(`Ticket créé: ${response.data.numero}`);
      return response.data;
    } else {
      log.error(`Échec création: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    log.error(`Erreur création: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function createTestData() {
  console.log('🎫 Création de tickets de test pour le dashboard\n');
  
  const testTickets = [
    { agence: 'Tunis Centre', service: 'Abonnement Internet', email: 'client1@test.com' },
    { agence: 'Sfax', service: 'Support Technique', email: 'client2@test.com' },
    { agence: 'Sousse', service: 'Facturation', email: 'client3@test.com' },
    { agence: 'Tunis Centre', service: 'Réclamations', email: 'client4@test.com' },
    { agence: 'Ariana', service: 'Services Entreprise', email: 'client5@test.com' },
    { agence: 'Tunis Centre', service: 'Support Technique', email: 'client6@test.com' },
    { agence: 'Sfax', service: 'Abonnement Internet', email: 'client7@test.com' },
    { agence: 'Sousse', service: 'Facturation', email: 'client8@test.com' }
  ];
  
  let successCount = 0;
  
  for (const ticket of testTickets) {
    const result = await createTestTicket(ticket.agence, ticket.service, ticket.email);
    if (result) {
      successCount++;
    }
    // Attendre un peu entre les créations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Résumé: ${successCount}/${testTickets.length} tickets créés`);
  
  // Vérifier les résultats
  console.log('\n🔍 Vérification des données...');
  try {
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats-debug`);
    if (statsResponse.data.success) {
      const stats = statsResponse.data.data.tickets;
      console.log(`📈 Statistiques mises à jour:`);
      console.log(`   Total: ${stats.total}`);
      console.log(`   En attente: ${stats.enAttente}`);
      console.log(`   En cours: ${stats.enCours}`);
      console.log(`   Terminés: ${stats.termines}`);
    }
  } catch (error) {
    log.error(`Erreur vérification: ${error.message}`);
  }
}

if (require.main === module) {
  createTestData();
}

module.exports = { createTestData };
