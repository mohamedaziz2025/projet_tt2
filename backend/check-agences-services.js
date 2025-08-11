const mysql = require('mysql2/promise');

async function checkAgencesServices() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'queue_management'
        });

        console.log('📋 Dernières agences créées:');
        const [agences] = await connection.execute('SELECT * FROM agences ORDER BY id DESC LIMIT 3');
        agences.forEach(agence => {
            console.log(`ID: ${agence.id} | Nom: ${agence.nom} | Active: ${agence.active} | Email: ${agence.email}`);
        });

        console.log('\n📋 Derniers services créés:');
        const [services] = await connection.execute('SELECT * FROM services ORDER BY id DESC LIMIT 3');
        services.forEach(service => {
            console.log(`ID: ${service.id} | Nom: ${service.nom} | Active: ${service.active} | Description: ${service.description}`);
        });

        await connection.end();
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

checkAgencesServices();
