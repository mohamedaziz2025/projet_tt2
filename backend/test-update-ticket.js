// Test de mise à jour du ticket 14
const { Ticket } = require('./models');

async function testUpdateTicket() {
    try {
        console.log('🔍 Test mise à jour ticket 14...');
        
        // Récupérer le ticket 14
        console.log('\n1. Recherche du ticket 14...');
        const ticket = await Ticket.findByPk(14);
        
        if (!ticket) {
            console.log('❌ Ticket 14 non trouvé');
            return;
        }
        
        console.log('✅ Ticket trouvé:', {
            id: ticket.id,
            agence: ticket.agence,
            service: ticket.service,
            status: ticket.status,
            email: ticket.email
        });

        // Test de mise à jour
        console.log('\n2. Mise à jour du statut...');
        const oldStatus = ticket.status;
        ticket.status = 'en_cours';
        
        console.log(`Changement: ${oldStatus} → ${ticket.status}`);
        
        // Sauvegarder
        console.log('\n3. Sauvegarde...');
        await ticket.save();
        
        console.log('✅ Mise à jour réussie !');
        
        // Vérification
        console.log('\n4. Vérification...');
        const updatedTicket = await Ticket.findByPk(14);
        console.log('Status final:', updatedTicket.status);
        
    } catch (error) {
        console.error('❌ Erreur test mise à jour:', error.message);
        console.error('Stack:', error.stack);
        if (error.sql) {
            console.error('SQL:', error.sql);
        }
    }
}

testUpdateTicket();
