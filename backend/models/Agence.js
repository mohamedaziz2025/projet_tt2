const { DataTypes } = require('sequelize');
const sequelize = require('../services/db');

const Agence = sequelize.define('Agence', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  adresse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  horaires_ouverture: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  services_disponibles: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  temps_moyen_service: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'agences',
  timestamps: true, // La table a created_at/updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  freezeTableName: true
});

module.exports = Agence;
