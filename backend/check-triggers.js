const mysql = require('mysql2/promise');

async function checkTriggers() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'queue_management'
        });

        console.log('🔍 Vérification des triggers sur la table tickets...');
        
        const [triggers] = await connection.execute(
            "SHOW TRIGGERS FROM queue_management WHERE `Table` = 'tickets'"
        );
        
        if (triggers.length > 0) {
            console.log('📋 Triggers trouvés:');
            triggers.forEach(trigger => {
                console.log(`- Nom: ${trigger.Trigger}`);
                console.log(`  Event: ${trigger.Event}`);
                console.log(`  Timing: ${trigger.Timing}`);
                console.log(`  Statement: ${trigger.Statement}`);
                console.log('');
            });
        } else {
            console.log('✅ Aucun trigger trouvé sur la table tickets');
        }

        await connection.end();
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

checkTriggers();
