const mysql = require('mysql2/promise');

async function removeTriggerDirect() {
    try {
        console.log('🔧 Suppression directe du trigger...');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'queue_management'
        });

        // Exécuter la commande DROP TRIGGER directement
        console.log('Exécution: DROP TRIGGER update_queue_position');
        
        const result = await connection.execute('DROP TRIGGER update_queue_position');
        
        console.log('✅ Trigger supprimé avec succès !');
        console.log('Résultat:', result);

        await connection.end();
        
    } catch (error) {
        console.error('❌ Erreur suppression trigger:', error.message);
        
        // Si l'erreur est "does not exist", c'est OK
        if (error.message.includes('does not exist')) {
            console.log('ℹ️ Le trigger n\'existe plus');
        }
    }
}

removeTriggerDirect();
