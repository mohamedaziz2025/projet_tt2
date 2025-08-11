const { DataTypes } = require('sequelize');
const sequelize = require('../services/db');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  agence: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  service: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  status: {
    type: DataTypes.ENUM('en_attente', 'en_cours', 'termine', 'annule'),
    defaultValue: 'en_attente',
    allowNull: false
  },
  heure_arrivee: {
    type: DataTypes.DATE,
    allowNull: true
  },
  heure_appel: {
    type: DataTypes.DATE,
    allowNull: true
  },
  heure_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimation_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 15
  },
  position_actuelle: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notification_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'notification_sent' // Mapping explicite
  },
  notification_3_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'notification_3_sent'
  },
  notification_5min_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'notification_5min_sent'
  }
}, {
  tableName: 'tickets', // Nom exact de la table MySQL
  timestamps: true,
  createdAt: 'created_at', // Mapper vers created_at en MySQL
  updatedAt: 'updated_at', // Mapper vers updated_at en MySQL
  underscored: false,
  freezeTableName: true
});

module.exports = Ticket;
