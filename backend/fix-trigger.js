const mysql = require('mysql2/promise');

async function removeTriggerPermanently() {
  let connection;
  try {
    // Connexion MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
    
    console.log('🔍 Vérification des triggers existants...');
    const [triggers] = await connection.execute(`
      SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE 
      FROM information_schema.TRIGGERS 
      WHERE TRIGGER_SCHEMA = 'queue_management'
    `);
    
    console.log('📋 Triggers trouvés:', triggers);
    
    // Supprimer le trigger problématique (utiliser query au lieu d'execute pour DDL)
    await connection.query('DROP TRIGGER IF EXISTS update_queue_position');
    console.log('✅ Trigger update_queue_position supprimé définitivement');
    
    // Vérifier qu'il est supprimé
    const [remainingTriggers] = await connection.execute(`
      SELECT TRIGGER_NAME FROM information_schema.TRIGGERS 
      WHERE TRIGGER_SCHEMA = 'queue_management'
    `);
    
    console.log('📋 Triggers restants:', remainingTriggers);
    
    // Test de mise à jour pour vérifier
    await connection.execute('UPDATE tickets SET status = "test" WHERE id = 1');
    await connection.execute('UPDATE tickets SET status = "en_attente" WHERE id = 1');
    console.log('✅ Test de mise à jour réussi sans trigger');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 Connexion fermée');
    }
  }
}

// Exécuter la fonction
removeTriggerPermanently();
