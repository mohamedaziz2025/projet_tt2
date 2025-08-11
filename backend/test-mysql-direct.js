// Test de connexion MySQL simple
const mysql = require('mysql2/promise');

async function testMySQL() {
  console.log('🔍 Test de connexion MySQL directe...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'queue_management'
    });

    console.log('✅ Connexion MySQL réussie');

    // Test simple
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM tickets');
    console.log('📊 Tickets dans la base:', rows[0].count);

    // Vérifier structure
    const [structure] = await connection.execute('DESCRIBE tickets');
    console.log('📋 Structure de la table:');
    structure.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));

    // Derniers tickets
    const [tickets] = await connection.execute('SELECT id, status, email, created_at FROM tickets ORDER BY id DESC LIMIT 3');
    console.log('🎫 Derniers tickets:');
    tickets.forEach(t => console.log(`  ID: ${t.id} | Status: ${t.status} | Email: ${t.email}`));

    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur MySQL:', error.message);
    console.error('Codes d\'erreur courants:');
    console.error('  ECONNREFUSED: MySQL server not running');
    console.error('  ER_BAD_DB_ERROR: Database "queue_management" does not exist');
    console.error('  ER_ACCESS_DENIED_ERROR: Wrong username/password');
  }
}

testMySQL();
