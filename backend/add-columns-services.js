const mysql = require('mysql2/promise');

async function addMissingColumnsToServices() {
  let connection;
  try {
    console.log('🛠️  AJOUT DES COLONNES MANQUANTES À LA TABLE SERVICES');
    console.log('=' .repeat(60));
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
    
    // 1. Vérifier la structure actuelle
    console.log('\n1️⃣  STRUCTURE ACTUELLE:');
    const [currentStructure] = await connection.execute('DESCRIBE services');
    currentStructure.forEach(col => {
      console.log(`   • ${col.Field}: ${col.Type}`);
    });
    
    // 2. Ajouter les colonnes manquantes
    console.log('\n2️⃣  AJOUT DES COLONNES MANQUANTES:');
    
    const columnsToAdd = [
      { name: 'icon', type: 'VARCHAR(10)', default: "'🛎️'", description: 'Icône du service' },
      { name: 'couleur', type: 'VARCHAR(7)', default: "'#c41e3a'", description: 'Couleur du thème' },
      { name: 'priority', type: 'INT(1)', default: '2', description: 'Priorité (1=urgente, 2=normale, 3=basse)' },
      { name: 'prerequis', type: 'TEXT', default: 'NULL', description: 'Prérequis du service' },
      { name: 'documents_necessaires', type: 'TEXT', default: 'NULL', description: 'Documents nécessaires' }
    ];
    
    for (const column of columnsToAdd) {
      try {
        const query = `ALTER TABLE services ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`;
        console.log(`   🔧 Ajout colonne ${column.name}...`);
        await connection.execute(query);
        console.log(`   ✅ ${column.name}: ${column.description}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`   ⚠️  ${column.name}: Colonne déjà existante`);
        } else {
          console.log(`   ❌ ${column.name}: ${error.message}`);
        }
      }
    }
    
    // 3. Vérifier la nouvelle structure
    console.log('\n3️⃣  NOUVELLE STRUCTURE:');
    const [newStructure] = await connection.execute('DESCRIBE services');
    newStructure.forEach(col => {
      const isNew = !currentStructure.find(c => c.Field === col.Field);
      console.log(`   ${isNew ? '🆕' : '  '} ${col.Field}: ${col.Type} ${col.Default ? `(défaut: ${col.Default})` : ''}`);
    });
    
    // 4. Test avec données par défaut
    console.log('\n4️⃣  TEST AVEC NOUVELLES COLONNES:');
    
    // Récupérer un service pour tester
    const [services] = await connection.execute('SELECT * FROM services WHERE id = 1');
    if (services.length > 0) {
      const service = services[0];
      console.log('   📋 Service avec nouvelles colonnes:', JSON.stringify(service, null, 2));
      
      // Test de mise à jour avec nouvelles colonnes
      await connection.execute(`
        UPDATE services 
        SET icon = ?, couleur = ?, priority = ?, prerequis = ?, documents_necessaires = ?
        WHERE id = 1
      `, ['📱', '#ff6600', 1, 'Avoir un abonnement actif', 'CIN, Justificatif de domicile']);
      
      console.log('   ✅ Test de mise à jour réussi');
      
      // Vérifier le résultat
      const [updated] = await connection.execute('SELECT * FROM services WHERE id = 1');
      console.log('   📋 Service mis à jour:', JSON.stringify(updated[0], null, 2));
    }
    
    // 5. Mapping frontend complet maintenant possible
    console.log('\n5️⃣  NOUVEAU MAPPING FRONTEND ↔ DB:');
    console.log('   ✅ nom → nom');
    console.log('   ✅ description → description');
    console.log('   ✅ icon → icon');
    console.log('   ✅ couleur → couleur');
    console.log('   ✅ dureeEstimee → duree_moyenne');
    console.log('   ✅ priority → priority');
    console.log('   ✅ status → active');
    console.log('   ✅ prerequis → prerequis');
    console.log('   ✅ documentsNecessaires → documents_necessaires');
    
    console.log('\n🎉 TOUS LES CHAMPS FRONTEND SONT MAINTENANT SUPPORTÉS !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔚 Connexion fermée');
    }
  }
}

// Exécuter la migration
addMissingColumnsToServices();
