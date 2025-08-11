console.log('🔧 Test de serveur minimal...');

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Import progressif des contrôleurs
try {
  console.log('📦 Chargement des contrôleurs...');
  const DashboardControllerDebug = require('./controllers/DashboardControllerDebug');
  console.log('✅ DashboardControllerDebug chargé');
  
  // Routes Dashboard
  app.get('/api/dashboard/health', DashboardControllerDebug.healthCheck);
  app.get('/api/dashboard/stats', DashboardControllerDebug.getStats);
  app.get('/api/dashboard/queue', DashboardControllerDebug.getQueueData);
  console.log('✅ Routes Dashboard configurées');
  
} catch (error) {
  console.error('❌ Erreur lors du chargement des contrôleurs:', error.message);
}

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Serveur avec contrôleurs fonctionne',
    timestamp: new Date().toISOString()
  });
});

// Gestion d'erreur
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(500).json({ error: err.message });
});

const PORT = 3001;

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur minimal sur le port ${PORT}`);
  console.log(`🔍 Test: http://localhost:${PORT}/api/test`);
});

server.on('error', (err) => {
  console.error('❌ Erreur serveur:', err);
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} occupé, essayons le port ${PORT + 1}`);
    server.listen(PORT + 1, () => {
      console.log(`✅ Serveur sur le port ${PORT + 1}`);
    });
  }
});
