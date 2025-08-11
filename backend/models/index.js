// Import de la configuration MySQL
const sequelize = require('../services/db');
const { Sequelize } = require('sequelize');

// Chargement des modèles MySQL
const Admin = require('./Admin');
const Agence = require('./Agence');
const Service = require('./Service');
const Ticket = require('./Ticket');

console.log('📦 Chargement des modèles MySQL...');
console.log('Models loaded:', { 
  Admin: !!Admin, 
  Agence: !!Agence, 
  Service: !!Service, 
  Ticket: !!Ticket 
});

// Export des modèles et de la connexion
module.exports = {
  sequelize,
  Sequelize,
  Admin,
  Agence,
  Service,
  Ticket
};
