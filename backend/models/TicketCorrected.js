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
      defaultValue: 'en_attente',
      allowNull: false
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
    },
    // Clés étrangères pour les associations
    agenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'agences',
        key: 'id'
      }
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'services',
        key: 'id'
      }
    }
  }, {
    tableName: 'Tickets',
    timestamps: true
  });

  // Associations
  Ticket.associate = (models) => {
    // Un ticket appartient à une agence
    Ticket.belongsTo(models.Agence, {
      foreignKey: 'agenceId',
      as: 'agenceData'
    });

    // Un ticket appartient à un service
    Ticket.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'serviceData'
    });
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

    return {
      total,
      enAttente,
      enCours,
      termines,
      tempsMoyen: 15 // Valeur par défaut basée sur estimation_minutes
    };
  };

  return Ticket;
};
