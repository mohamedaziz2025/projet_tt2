const { Ticket } = require('./models');

async function createTestTickets() {
  try {
    console.log('🎫 Création de tickets de test...');
    
    // Vérifier si des tickets existent déjà
    const existingCount = await Ticket.count();
    console.log(`📊 Tickets existants: ${existingCount}`);
    
    if (existingCount === 0) {
      await Ticket.bulkCreate([
        {
          agence: 'Agence Tunis Centre',
          service: 'Nouvelle ligne mobile',
          status: 'en_attente',
          email: 'test1@example.com',
          heure_arrivee: new Date(),
          estimation_minutes: 15
        },
        {
          agence: 'Agence Sfax Nord',
          service: 'Internet ADSL',
          status: 'en_cours',
          email: 'test2@example.com',
          heure_arrivee: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
          estimation_minutes: 25
        },
        {
          agence: 'Agence Sousse Centre',
          service: 'Support technique',
          status: 'termine',
          email: 'test3@example.com',
          heure_arrivee: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          estimation_minutes: 10
        }
      ]);
      console.log('✅ Tickets de test créés');
    } else {
      console.log('ℹ️ Des tickets existent déjà, pas de création');
    }
    
    // Afficher tous les tickets
    const allTickets = await Ticket.findAll();
    console.log('📋 Tous les tickets:');
    allTickets.forEach(ticket => {
      console.log(`- ${ticket.id}: ${ticket.service} (${ticket.status}) - ${ticket.agence}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestTickets();
