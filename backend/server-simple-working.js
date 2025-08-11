require('dotenv').config();
console.log('🚀 Démarrage du serveur simplifié...');

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware de base
app.use(cors());
app.use(express.json());

// Import des contrôleurs qui fonctionnent
const DashboardControllerDebug = require('./controllers/DashboardControllerDebug');
const AgenceController = require('./controllers/AgenceController');
const ServiceController = require('./controllers/ServiceController');

console.log('📦 Contrôleurs chargés');

// Routes Dashboard (qui fonctionnent)
app.get('/api/dashboard/health', DashboardControllerDebug.healthCheck);
app.get('/api/dashboard/stats', DashboardControllerDebug.getStats);
app.get('/api/dashboard/queue', DashboardControllerDebug.getQueueData);

// Routes Agences
app.get('/api/agences', AgenceController.getAll);
app.get('/api/agences/:id', AgenceController.getById);
app.post('/api/agences', AgenceController.create);
app.put('/api/agences/:id', AgenceController.update);
app.delete('/api/agences/:id', AgenceController.delete);

// Routes Services  
app.get('/api/services', ServiceController.getAll);
app.get('/api/services/:id', ServiceController.getById);
app.post('/api/services', ServiceController.create);
app.put('/api/services/:id', ServiceController.update);
app.delete('/api/services/:id', ServiceController.delete);

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Serveur fonctionnel après migration',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.message);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔍 Test: http://localhost:${PORT}/api/test`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/health`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});
