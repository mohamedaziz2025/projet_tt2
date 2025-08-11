const mysql = require('mysql2/promise');

async function verifyServiceFields() {
  let connection;
  try {
    console.log('🔍 Vérification des champs services...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
    
    // 1. Structure de la table services
    console.log('\n📋 Structure table services:');
    const [columns] = await connection.execute('DESCRIBE services');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    // 2. Données existantes
    console.log('\n📋 Services existants:');
    const [services] = await connection.execute('SELECT * FROM services');
    console.log(`Total services: ${services.length}`);
    services.forEach(service => {
      console.log(`  - ${service.id}: "${service.nom}" (${service.duree_moyenne}min, active: ${service.active})`);
    });
    
    // 3. Mapping Frontend vs Database
    console.log('\n🔄 MAPPING CHAMPS:');
    console.log('Frontend utilise:');
    console.log('  - nom ✅ (existe en DB)');
    console.log('  - description ✅ (existe en DB)');
    console.log('  - dureeEstimee ❌ -> duree_moyenne (mapping nécessaire)');
    console.log('  - icon ❌ (pas en DB, valeur par défaut)');
    console.log('  - couleur ❌ (pas en DB, valeur par défaut)');
    console.log('  - priority ❌ (pas en DB, valeur par défaut)');
    console.log('  - status ❌ -> active (mapping nécessaire)');
    console.log('  - prerequis ❌ (pas en DB, valeur par défaut)');
    console.log('  - documentsNecessaires ❌ (pas en DB, valeur par défaut)');
    
    // 4. Test de mapping
    console.log('\n🧪 Test de mapping:');
    const testService = services[0];
    
    const frontendFormat = {
      id: testService.id,
      nom: testService.nom,
      description: testService.description,
      icon: '🛎️', // Valeur par défaut
      couleur: '#c41e3a', // Valeur par défaut
      dureeEstimee: testService.duree_moyenne,
      priority: 2, // Valeur par défaut (normale)
      status: testService.active ? 'active' : 'disabled',
      prerequis: '', // Valeur par défaut
      documentsNecessaires: '' // Valeur par défaut
    };
    
    console.log('Service DB:', testService);
    console.log('Service Frontend format:', frontendFormat);
    
    // 5. Test de modification
    console.log('\n✏️ Test de modification d\'un service...');
    await connection.execute(
      'UPDATE services SET description = ?, duree_moyenne = ? WHERE id = 1',
      ['Description mise à jour via SQL direct', 20]
    );
    console.log('✅ Service modifié avec succès');
    
    // Vérifier la modification
    const [updated] = await connection.execute('SELECT * FROM services WHERE id = 1');
    console.log('Service après modification:', updated[0]);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 Connexion fermée');
    }
  }
}

// Exécuter la vérification
verifyServiceFields();
