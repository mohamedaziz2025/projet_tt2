// Test de l'API de mise à jour avec gestion d'erreur détaillée
const axios = require('axios');

async function testUpdateAPI() {
    try {
        console.log('🧪 Test API mise à jour ticket 14...');
        
        const url = 'http://localhost:5000/api/dashboard/tickets/14/status';
        const data = { status: 'en_cours' };
        
        console.log('URL:', url);
        console.log('Data:', data);
        
        const response = await axios.put(url, data, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ SUCCESS !');
        console.log('Status HTTP:', response.status);
        console.log('Réponse:', response.data);
        
    } catch (error) {
        console.error('❌ ERREUR détaillée:');
        console.error('Message:', error.message);
        
        if (error.response) {
            console.error('Status HTTP:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request envoyé mais pas de réponse');
            console.error('Request:', error.request);
        } else {
            console.error('Erreur config:', error.config);
        }
    }
}

testUpdateAPI();
