// Test direct de l'API avec Node.js
const axios = require('axios');

async function testAPI() {
    try {
        console.log('🔍 Test direct de l\'API /dashboard/queue...');
        
        const response = await axios.get('http://localhost:5000/api/dashboard/queue');
        
        console.log('📊 Réponse API:');
        console.log('- Status:', response.status);
        console.log('- Total tickets:', response.data.total || response.data.queue?.length || 'N/A');
        
        const tickets = response.data.queue || response.data.data?.tickets || [];
        
        console.log('\n📋 Derniers tickets (ordre décroissant):');
        tickets
            .sort((a, b) => b.id - a.id)
            .slice(0, 5)
            .forEach(ticket => {
                console.log(`ID: ${ticket.id} | Agence: ${ticket.agence} | Service: ${ticket.service} | Email: ${ticket.email} | Status: ${ticket.status}`);
            });

        console.log('\n🔍 Comparaison avec Sequelize direct:');
        const { Ticket } = require('./models');
        const sequelizeTickets = await Ticket.findAll({
            order: [['id', 'DESC']],
            limit: 5,
            raw: true
        });
        
        sequelizeTickets.forEach(ticket => {
            console.log(`SEQUELIZE - ID: ${ticket.id} | Agence: ${ticket.agence} | Service: ${ticket.service} | Email: ${ticket.email} | Status: ${ticket.status}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur API:', error.response?.data || error.message);
    }
}

testAPI();
