const mysql = require('mysql2/promise');

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });

    console.log('🔍 TABLES dans queue_management:');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach(t => console.log('- ' + Object.values(t)[0]));

    console.log('\n📊 Comparaison des données:');
    try {
      const [tickets1] = await connection.execute('SELECT COUNT(*) as count FROM tickets');
      console.log('Table tickets (minuscule):', tickets1[0].count, 'enregistrements');
    } catch (e) {
      console.log('Table tickets (minuscule): N\'existe pas');
    }

    try {
      const [tickets2] = await connection.execute('SELECT COUNT(*) as count FROM Tickets');
      console.log('Table Tickets (majuscule):', tickets2[0].count, 'enregistrements');
    } catch (e) {
      console.log('Table Tickets (majuscule): N\'existe pas');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkTables();
