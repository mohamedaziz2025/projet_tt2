const mysql = require('mysql2/promise');

async function checkAgenceFields() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'queue_management'
        });

        console.log('📋 Champs de la table agences:');
        const [fields] = await connection.execute('DESCRIBE agences');
        fields.forEach(field => {
            console.log(`${field.Field}: ${field.Type} ${field.Null === 'NO' ? '(Required)' : '(Optional)'}`);
        });

        await connection.end();
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

checkAgenceFields();
