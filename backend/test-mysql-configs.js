// Test de différentes configurations MySQL
const mysql = require('mysql2/promise');

const configs = [
  {
    name: 'Configuration .env',
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'queue_management'
  },
  {
    name: 'Sans database',
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ''
  }
];

async function testConfigs() {
  console.log('🔍 Test des configurations MySQL...\n');

  for (let config of configs) {
    console.log(`📡 Test: ${config.name}`);
    try {
      const connection = await mysql.createConnection(config);
      console.log('  ✅ Connexion réussie');

      if (!config.database) {
        // Lister les bases disponibles
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('  📋 Bases disponibles:');
        databases.forEach(db => console.log(`    - ${Object.values(db)[0]}`));
      } else {
        // Tester la table tickets
        try {
          const [tables] = await connection.execute('SHOW TABLES');
          console.log('  📋 Tables dans queue_management:');
          tables.forEach(table => console.log(`    - ${Object.values(table)[0]}`));
          
          if (tables.some(t => Object.values(t)[0] === 'tickets')) {
            const [count] = await connection.execute('SELECT COUNT(*) as count FROM tickets');
            console.log(`  🎫 Tickets: ${count[0].count}`);
          }
        } catch (err) {
          console.log('  ❌ Erreur table:', err.message);
        }
      }

      await connection.end();
      console.log('');
    } catch (error) {
      console.log(`  ❌ Échec: ${error.message}`);
      console.log('');
    }
  }
}

testConfigs();
