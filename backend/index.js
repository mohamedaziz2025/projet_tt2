require('dotenv').config();
console.log('🚀 Démarrage du serveur...');

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
console.log('📦 Modules de base chargés');

const app = express();
const server = http.createServer(app);

// Configuration Socket.IO
console.log('🔌 Configuration Socket.IO...');
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

console.log('📂 Chargement des routes...');
const ticketRoutes = require('./routes/ticketRoutes');
const ticketSQLRoutes = require('./routes/ticketSQL'); // ⚡ Nouvelles routes SQL
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const agenceRoutes = require('./routes/agences');
const serviceRoutes = require('./routes/services');
const serviceSQLRoutes = require('./routes/serviceSQL'); // ⚡ Nouvelles routes SQL services
console.log('✅ Routes chargées');

const { createDefaultAdmin } = require('./services/authService');
const notificationService = require('./services/notificationService');
console.log('📋 Services chargés');

// Middleware
console.log('⚙️ Configuration des middlewares...');
app.use(cors());
app.use(express.json());

// Rendre io accessible dans les routes
app.set('io', io);

// Routes
console.log('🛣️ Configuration des routes...');
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets-sql', ticketSQLRoutes); // ⚡ Routes SQL pour tickets
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/agences', agenceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/services-sql', serviceSQLRoutes); // ⚡ Routes SQL pour services
console.log('✅ Routes configurées');

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Gestion de file d\'attente - Tunisie Telecom',
    features: ['tickets', 'admin', 'notifications', 'real-time']
  });
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Nouvelle connexion Socket.IO:', socket.id);
  
  // Rejoindre la room admin
  socket.on('join-admin', (data) => {
    socket.join('admin-room');
    console.log('👨‍💼 Admin rejoint la room:', socket.id);
  });
  
  // Quitter la room admin
  socket.on('leave-admin', () => {
    socket.leave('admin-room');
    console.log('👨‍💼 Admin quitte la room:', socket.id);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Déconnexion Socket.IO:', socket.id);
  });
});

// Fonction pour émettre des événements aux admins
global.emitToAdmins = (event, data) => {
  io.to('admin-room').emit(event, data);
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled on port ${PORT}`);
  // Créer l'admin par défaut au démarrage
  await createDefaultAdmin();
  console.log('🔔 Services de notification démarrés');
});

