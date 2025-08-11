const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    agence: {
      type: DataTypes.STRING,
      allowNull: false
    },
    service: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'en_attente'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    heure_arrivee: {
      type: DataTypes.DATE,
      allowNull: false
    },
    estimation_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15
    }
  }, {
    tableName: 'Tickets',
    timestamps: true
  });

  // Associations
  Ticket.associate = (models) => {
    // Les associations seront ajoutées plus tard si nécessaire
  };

  // Méthodes d'instance
  Ticket.prototype.getTempsAttente = function() {
    // Sera implémenté quand les colonnes seront disponibles
    return null;
  };

  Ticket.prototype.getDureeTraitement = function() {
    // Sera implémenté quand les colonnes seront disponibles
    return null;
  };

  // Méthodes de classe
  Ticket.getStatistiques = async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tickets = await this.findAll({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: today,
          [require('sequelize').Op.lt]: tomorrow
        }
      }
    });

    const total = tickets.length;
    const enAttente = tickets.filter(t => t.status === 'en_attente').length;
    const enCours = tickets.filter(t => t.status === 'en_cours').length;
    const termines = tickets.filter(t => t.status === 'termine').length;

    // Temps moyen basé sur estimation_minutes
    const tempsMoyen = tickets.length > 0 
      ? Math.round(tickets.reduce((acc, t) => acc + t.estimation_minutes, 0) / tickets.length)
      : 0;

    return {
      total,
      enAttente,
      enCours,
      termines,
      tempsMoyen
    };
  };

  return Ticket;
};
