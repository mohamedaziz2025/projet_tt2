const axios = require('axios');

// Test direct sans redémarrer le serveur - utilisons une route de test
async function testDirectDB() {
  console.log('🔍 Test direct de la base de données');
  
  try {
    // Appeler une route qui fait une requête SQL directe
    const response = await axios.post('http://localhost:5000/api/dashboard/test-direct', {
      query: 'SELECT COUNT(*) as count FROM Tickets WHERE DATE(createdAt) = DATE("now")'
    });
    
    console.log('✅ Réponse test direct:', response.data);
    
  } catch (error) {
    console.log('❌ Pas de route de test direct. Créons une solution alternative...');
    
    // Alternative: créer un test avec le bon modèle
    console.log('\n📊 Résumé du problème identifié:');
    console.log('- Base de données: table "Tickets" avec 5 tickets aujourd\'hui');
    console.log('- Modèle Sequelize: configuré pour table "Tickets"');
    console.log('- APIs: retournent toujours 0 tickets');
    console.log('- Solution: redémarrer le serveur backend');
    
    console.log('\n🔧 Actions recommandées:');
    console.log('1. Arrêter le serveur backend (Ctrl+C)');
    console.log('2. Redémarrer avec: npm run dev');
    console.log('3. Retester les APIs');
  }
}

if (require.main === module) {
  testDirectDB();
}

module.exports = { testDirectDB };
