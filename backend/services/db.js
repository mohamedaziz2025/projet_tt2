const { Sequelize } = require('sequelize');
const path = require('path');

// Configuration MySQL pour production (utiliser les vraies données)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'queue_management',
  process.env.DB_USER || 'root', 
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+01:00', // Tunisie timezone
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

// Test de connexion et synchronisation
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à MySQL réussie.');
    
    // Importer les modèles
    require('../models/Ticket');
    require('../models/Admin');
    require('../models/Agence');
    require('../models/Service');
    
    // Ne pas forcer la synchronisation pour éviter de perdre les données
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Modèles synchronisés avec MySQL.');
  } catch (error) {
    console.error('❌ Erreur de connexion à MySQL:', error);
    console.error('Vérifiez que MySQL est démarré et que la base "queue_management" existe');
  }
}

initializeDatabase();

module.exports = sequelize;
