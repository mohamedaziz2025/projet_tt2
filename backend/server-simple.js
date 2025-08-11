const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route de test simple
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Gestion de file d\'attente - Tunisie Telecom',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Test des routes agences et services sans modèles
app.get('/api/agences', (req, res) => {
  res.json({ 
    agences: [
      { id: 1, nom: 'Agence Test', ville: 'Tunis', statut: 'active' }
    ],
    message: 'Test réussi'
  });
});

app.get('/api/services', (req, res) => {
  res.json({ 
    services: [
      { id: 1, nom: 'Service Test', code: 'TEST001', statut: 'actif' }
    ],
    message: 'Test réussi'
  });
});

// Routes dashboard simplifiées
app.get('/api/dashboard/queue', (req, res) => {
  res.json({ 
    queue: [],
    total: 0,
    message: 'File d\'attente vide'
  });
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({ 
    totalTickets: 0,
    ticketsEnAttente: 0,
    ticketsEnCours: 0,
    ticketsTermines: 0,
    tempsMoyen: 0
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
  console.log(`📡 Toutes les routes de test sont actives`);
});

// Gestion des erreurs
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non gérée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});
