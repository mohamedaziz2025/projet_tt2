const mysql = require('mysql2/promise');

async function testServiceFieldsMapping() {
  let connection;
  try {
    console.log('🧪 TEST PRATIQUE - CHAMPS SERVICES');
    console.log('=' .repeat(60));
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
    
    // 1. Structure actuelle de la DB
    console.log('\n1️⃣  STRUCTURE ACTUELLE DB:');
    const [structure] = await connection.execute('DESCRIBE services');
    structure.forEach(col => {
      console.log(`   • ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    // 2. Données existantes 
    console.log('\n2️⃣  SERVICE EXISTANT (brut DB):');
    const [services] = await connection.execute('SELECT * FROM services WHERE id = 1');
    const serviceDb = services[0];
    console.log('   📋 Données DB:', JSON.stringify(serviceDb, null, 2));
    
    // 3. Simulation du mapping DB → Frontend
    console.log('\n3️⃣  MAPPING DB → FRONTEND:');
    const frontendFormat = {
      id: serviceDb.id,
      nom: serviceDb.nom,                          // ✅ EXISTE
      description: serviceDb.description,          // ✅ EXISTE  
      dureeEstimee: serviceDb.duree_moyenne,       // 🔄 MAPPÉ (duree_moyenne → dureeEstimee)
      status: serviceDb.active ? 'active' : 'disabled',  // 🔄 CONVERTI (1/0 → active/disabled)
      
      // ❌ CHAMPS MANQUANTS - VALEURS PAR DÉFAUT:
      icon: '🛎️',                                 // Frontend attend icon
      couleur: '#c41e3a',                         // Frontend attend couleur
      priority: 2,                                // Frontend attend priority
      prerequis: '',                             // Frontend attend prerequis
      documentsNecessaires: ''                    // Frontend attend documentsNecessaires
    };
    
    console.log('   🎨 Format Frontend:', JSON.stringify(frontendFormat, null, 2));
    
    // 4. Simulation de données Frontend → DB
    console.log('\n4️⃣  TEST SOUMISSION FRONTEND → DB:');
    const frontendSubmission = {
      nom: 'Nouveau Service Test',
      description: 'Service créé via frontend',
      icon: '📱',                    // ❌ Sera ignoré
      couleur: '#ff0000',            // ❌ Sera ignoré  
      dureeEstimee: 25,             // 🔄 → duree_moyenne
      priority: 1,                  // ❌ Sera ignoré
      status: 'active',             // 🔄 → active = 1
      prerequis: 'Avoir CIN',       // ❌ Sera ignoré
      documentsNecessaires: 'CIN, Facture'  // ❌ Sera ignoré
    };
    
    console.log('   📝 Données Frontend:', JSON.stringify(frontendSubmission, null, 2));
    
    // Mapping pour DB
    const dbData = {
      nom: frontendSubmission.nom,
      description: frontendSubmission.description,
      duree_moyenne: frontendSubmission.dureeEstimee,
      active: frontendSubmission.status === 'active' ? 1 : 0
      // icon, couleur, priority, prerequis, documentsNecessaires → PERDUS!
    };
    
    console.log('   💾 Données pour DB:', JSON.stringify(dbData, null, 2));
    
    // 5. Analyse des pertes
    console.log('\n5️⃣  ANALYSE DES PERTES DE DONNÉES:');
    const champsIgnores = ['icon', 'couleur', 'priority', 'prerequis', 'documentsNecessaires'];
    console.log('   ❌ Champs frontend IGNORÉS lors de la sauvegarde:');
    champsIgnores.forEach(champ => {
      console.log(`      • ${champ}: "${frontendSubmission[champ]}" → PERDU`);
    });
    
    // 6. Test réel d'insertion 
    console.log('\n6️⃣  TEST RÉEL D\'INSERTION:');
    try {
      await connection.execute('DELETE FROM services WHERE nom = ?', ['Nouveau Service Test']);
      
      const [result] = await connection.execute(
        'INSERT INTO services (nom, description, duree_moyenne, active) VALUES (?, ?, ?, ?)',
        [dbData.nom, dbData.description, dbData.duree_moyenne, dbData.active]
      );
      
      console.log(`   ✅ Service inséré avec ID: ${result.insertId}`);
      
      // Récupérer le service inséré
      const [inserted] = await connection.execute('SELECT * FROM services WHERE id = ?', [result.insertId]);
      console.log('   📋 Service récupéré:', JSON.stringify(inserted[0], null, 2));
      
      // Nettoyer
      await connection.execute('DELETE FROM services WHERE id = ?', [result.insertId]);
      console.log('   🧹 Service de test supprimé');
      
    } catch (error) {
      console.log('   ❌ Erreur insertion:', error.message);
    }
    
    // 7. Résumé
    console.log('\n7️⃣  RÉSUMÉ:');
    console.log('   ✅ CHAMPS QUI FONCTIONNENT:');
    console.log('      • nom (direct)');
    console.log('      • description (direct)');
    console.log('      • dureeEstimee ↔ duree_moyenne (mapping)');
    console.log('      • status ↔ active (conversion)');
    
    console.log('   ❌ CHAMPS PERDUS:');
    console.log('      • icon (personnalisation d\'icône)');
    console.log('      • couleur (thème de couleur)');
    console.log('      • priority (niveau de priorité)');
    console.log('      • prerequis (prérequis du service)');
    console.log('      • documentsNecessaires (documents requis)');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔚 Test terminé');
    }
  }
}

// Lancer le test
testServiceFieldsMapping();
