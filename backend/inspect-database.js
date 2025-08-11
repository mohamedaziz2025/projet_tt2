const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur connexion DB:', err.message);
    return;
  }
  console.log('✅ Connecté à la base de données SQLite');
});

// Fonction pour exécuter des requêtes de lecture
function queryDB(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function inspectDatabase() {
  console.log('🔍 Inspection de la base de données\n');
  
  try {
    // Vérifier les tables existantes
    console.log('📋 Tables existantes:');
    const tables = await queryDB(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    tables.forEach(table => console.log(`   - ${table.name}`));
    
    // Compter les tickets total
    console.log('\n🎫 Tickets dans la base:');
    const totalTickets = await queryDB('SELECT COUNT(*) as count FROM tickets');
    console.log(`   Total tickets: ${totalTickets[0].count}`);
    
    // Tickets par statut
    const statusCount = await queryDB(`
      SELECT status, COUNT(*) as count 
      FROM tickets 
      GROUP BY status
    `);
    console.log('   Par statut:');
    statusCount.forEach(row => console.log(`     ${row.status}: ${row.count}`));
    
    // Tickets d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const todayTickets = await queryDB(`
      SELECT COUNT(*) as count 
      FROM tickets 
      WHERE DATE(createdAt) = ?
    `, [today]);
    console.log(`   Aujourd'hui (${today}): ${todayTickets[0].count}`);
    
    // Derniers tickets créés
    console.log('\n📝 Derniers tickets créés:');
    const recentTickets = await queryDB(`
      SELECT id, agence, service, status, email, 
             datetime(createdAt, 'localtime') as created_local
      FROM tickets 
      ORDER BY createdAt DESC 
      LIMIT 10
    `);
    recentTickets.forEach(ticket => {
      console.log(`   #${ticket.id} - ${ticket.agence} | ${ticket.service} | ${ticket.status} | ${ticket.created_local}`);
    });
    
    // Vérifier les agences
    console.log('\n🏢 Agences:');
    try {
      const agences = await queryDB('SELECT * FROM agences LIMIT 5');
      console.log(`   Total agences: ${agences.length}`);
      agences.forEach(agence => {
        console.log(`   - ${agence.nom} (${agence.code}) - ${agence.statut}`);
      });
    } catch (err) {
      console.log('   ⚠️ Erreur agences:', err.message);
    }
    
    // Vérifier les services
    console.log('\n🛎️ Services:');
    try {
      const services = await queryDB('SELECT * FROM services LIMIT 10');
      console.log(`   Total services: ${services.length}`);
      services.forEach(service => {
        console.log(`   - ${service.nom} (${service.code}) - ${service.statut}`);
      });
    } catch (err) {
      console.log('   ⚠️ Erreur services:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur inspection:', error.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Erreur fermeture DB:', err.message);
      } else {
        console.log('\n✅ Base de données fermée');
      }
    });
  }
}

if (require.main === module) {
  inspectDatabase();
}

module.exports = { inspectDatabase };
