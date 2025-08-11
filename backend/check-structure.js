const mysql = require('mysql2/promise');

async function checkDatabaseStructure() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
    
    console.log('🔗 Connexion MySQL établie');

    // Vérifier la structure des tickets
    console.log('\n📋 STRUCTURE DE LA TABLE TICKETS:');
    const [ticketStructure] = await connection.execute('DESCRIBE tickets');
    ticketStructure.forEach(field => {
      console.log(`   - ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(nullable)' : '(required)'} ${field.Key ? '(' + field.Key + ')' : ''}`);
    });

    // Vérifier quelques tickets
    console.log('\n🎫 TICKETS EXISTANTS (avec vraies colonnes):');
    const [tickets] = await connection.execute(`
      SELECT * FROM tickets 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    if (tickets.length > 0) {
      console.log('Colonnes disponibles:', Object.keys(tickets[0]));
      tickets.forEach(ticket => {
        console.log(`   - Ticket ${ticket.id}: Status=${ticket.status}, Agence=${ticket.agence}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 Connexion fermée');
    }
  }
}

checkDatabaseStructure();
