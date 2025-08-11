// Test simple pour diagnostiquer le problème Ticket
const { Ticket } = require('./models');

async function testSimple() {
    try {
        console.log('🔍 Test simple du modèle Ticket...');
        
        // Test 1: Compter tous les tickets
        console.log('\n1. Comptage total...');
        const total = await Ticket.count();
        console.log('✅ Total tickets:', total);
        
        // Test 2: Récupérer 3 tickets sans timestamps
        console.log('\n2. Récupération simple (sans timestamps)...');
        const tickets = await Ticket.findAll({
            attributes: ['id', 'agence', 'service', 'status', 'email'],
            limit: 3,
            order: [['id', 'DESC']],
            raw: true
        });
        
        console.log('✅ Tickets récupérés:', tickets.length);
        tickets.forEach(t => {
            console.log(`  ID: ${t.id} | Agence: ${t.agence} | Service: ${t.service} | Status: ${t.status}`);
        });

        // Test 3: Test avec heure_arrivee seulement
        console.log('\n3. Test avec heure_arrivee...');
        const ticketsWithTime = await Ticket.findAll({
            attributes: ['id', 'agence', 'service', 'status', 'heure_arrivee'],
            limit: 2,
            order: [['id', 'DESC']],
            raw: true
        });
        
        console.log('✅ Tickets avec heure:', ticketsWithTime.length);
        
    } catch (error) {
        console.error('❌ Erreur test simple:', error.message);
        console.error('SQL:', error.sql);
    }
}

testSimple();
