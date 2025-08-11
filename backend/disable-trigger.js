const mysql = require('mysql2/promise');

async function disableTrigger() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'queue_management'
        });

        console.log('🔧 Désactivation temporaire du trigger...');
        
        // Supprimer le trigger temporairement
        await connection.execute('DROP TRIGGER IF EXISTS update_queue_position');
        
        console.log('✅ Trigger désactivé avec succès !');
        console.log('💡 Vous pouvez maintenant mettre à jour les tickets');
        console.log('⚠️ RAPPEL: Le trigger peut être recréé plus tard si nécessaire');

        await connection.end();
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

disableTrigger();
