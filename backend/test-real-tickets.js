const mysql = require('mysql2/promise');

async function testRealData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });

    console.log('🔍 VÉRIFICATION des vrais tickets MySQL:');
    
    // Vérifier les tickets 13-14 (nouveaux)
    const [nouveaux] = await connection.execute(
      'SELECT id, agence, service, status, email, created_at FROM tickets WHERE id >= 13 ORDER BY id DESC'
    );
    console.log('\n📋 Nouveaux tickets (13-14):');
    nouveaux.forEach(t => console.log(`ID: ${t.id} | Agence: ${t.agence} | Service: ${t.service} | Status: ${t.status} | Email: ${t.email}`));

    // Vérifier TOUS les tickets en_attente
    const [attente] = await connection.execute(
      'SELECT id, agence, service, status FROM tickets WHERE status = "en_attente" ORDER BY id'
    );
    console.log('\n⏳ TOUS les tickets en_attente:');
    attente.forEach(t => console.log(`ID: ${t.id} | Agence: ${t.agence} | Service: ${t.service}`));

    await connection.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testRealData();
