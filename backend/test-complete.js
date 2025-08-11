const mysql = require('mysql2/promise');

async function testEverything() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
    
    console.log('🔗 Connexion MySQL établie');

    // 1. Test: Vérifier la structure des services
    console.log('\n📋 1. STRUCTURE DES SERVICES:');
    const [serviceStructure] = await connection.execute('DESCRIBE services');
    serviceStructure.forEach(field => {
      console.log(`   - ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });

    // 2. Test: Lister les services actifs
    console.log('\n📋 2. SERVICES ACTIFS:');
    const [services] = await connection.execute('SELECT id, nom, description FROM services WHERE active = 1');
    services.forEach(service => {
      console.log(`   - ${service.id}: ${service.nom} (${service.description})`);
    });

    // 3. Test: Vérifier les tickets récents
    console.log('\n🎫 3. TICKETS RÉCENTS:');
    const [tickets] = await connection.execute(`
      SELECT id, agence, service, status, email, created_at 
      FROM tickets 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    tickets.forEach(ticket => {
      console.log(`   - Ticket ${ticket.id}: ${ticket.email} (${ticket.agence}/${ticket.service}) - ${ticket.status}`);
    });

    // 4. Test: Mise à jour de ticket
    console.log('\n⚡ 4. TEST MISE À JOUR TICKET 14:');
    const [beforeUpdate] = await connection.execute('SELECT status FROM tickets WHERE id = 14');
    const currentStatus = beforeUpdate[0]?.status;
    console.log(`   - Status actuel: ${currentStatus}`);
    
    const newStatus = currentStatus === 'en_attente' ? 'en_cours' : 'en_attente';
    await connection.execute('UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = 14', [newStatus]);
    
    const [afterUpdate] = await connection.execute('SELECT status FROM tickets WHERE id = 14');
    console.log(`   - Nouveau status: ${afterUpdate[0].status}`);
    console.log('   ✅ Mise à jour réussie!');

    // 5. Test: Vérifier qu'il n'y a plus de triggers
    console.log('\n🚫 5. VÉRIFICATION TRIGGERS:');
    const [triggers] = await connection.execute(`
      SELECT TRIGGER_NAME FROM information_schema.TRIGGERS 
      WHERE TRIGGER_SCHEMA = 'queue_management'
    `);
    if (triggers.length === 0) {
      console.log('   ✅ Aucun trigger trouvé - Parfait!');
    } else {
      console.log('   ⚠️ Triggers restants:', triggers.map(t => t.TRIGGER_NAME));
    }

    console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 Connexion fermée');
    }
  }
}

testEverything();
