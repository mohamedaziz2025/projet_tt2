console.log('🔧 Test de démarrage du serveur...');

try {
  // Test de chargement des modèles
  console.log('📦 Chargement des modèles...');
  const { Ticket, Agence, Service, Admin } = require('./models');
  console.log('✅ Modèles chargés:', {
    Ticket: !!Ticket,
    Agence: !!Agence, 
    Service: !!Service,
    Admin: !!Admin
  });
  
  // Test de démarrage du serveur
  console.log('🚀 Démarrage du serveur...');
  const express = require('express');
  const app = express();
  
  // Middleware de base
  app.use(express.json());
  
  // Route de test simple
  app.get('/test', (req, res) => {
    res.json({ status: 'ok', message: 'Serveur fonctionnel' });
  });
  
  const server = app.listen(5001, () => {
    console.log('✅ Serveur de test démarré sur le port 5001');
    
    // Test de la route
    const http = require('http');
    http.get('http://localhost:5001/test', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Route de test OK:', data);
        server.close();
        process.exit(0);
      });
    }).on('error', (err) => {
      console.error('❌ Erreur test route:', err.message);
      server.close();
      process.exit(1);
    });
  });
  
} catch (error) {
  console.error('❌ Erreur de démarrage:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
