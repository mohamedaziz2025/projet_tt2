// Test comparatif entre MySQL direct et Sequelize
const { Ticket, Agence, Service } = require('./models');

async function compareData() {
    try {
        console.log('🔍 Test Sequelize vs MySQL direct...\n');

        // Test avec Sequelize
        console.log('📋 TICKETS via Sequelize (derniers 5):');
        const sequelizeTickets = await Ticket.findAll({
            limit: 5,
            order: [['id', 'DESC']],
            raw: true
        });
        
        sequelizeTickets.forEach(ticket => {
            console.log(`ID: ${ticket.id} | Agence: ${ticket.agence_id || ticket.agence} | Service: ${ticket.service_id || ticket.service} | Email: ${ticket.email} | Status: ${ticket.status}`);
        });

        console.log('\n🔍 Vérification structure Sequelize:');
        const firstTicket = await Ticket.findOne({ raw: true });
        if (firstTicket) {
            console.log('Propriétés du ticket:', Object.keys(firstTicket));
        }

        console.log('\n🏢 AGENCES via Sequelize:');
        const agences = await Agence.findAll({ raw: true });
        agences.forEach(agence => {
            console.log(`ID: ${agence.id} | Nom: ${agence.nom} | Code: ${agence.code} | Active: ${agence.active}`);
        });

        console.log('\n⚙️ SERVICES via Sequelize:');
        const services = await Service.findAll({ raw: true });
        services.forEach(service => {
            console.log(`ID: ${service.id} | Nom: ${service.nom} | Active: ${service.active}`);
        });

    } catch (error) {
        console.error('❌ Erreur Sequelize:', error.message);
        console.error('Stack:', error.stack);
    }
}

compareData();
