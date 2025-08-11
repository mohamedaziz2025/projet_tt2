const { Op } = require('sequelize');

/**
 * Nouveau contrôleur dashboard avec logging détaillé
 */
class DashboardControllerDebug {
  
  static async getQueueData(req, res) {
    console.log('[DEBUG] DashboardController.getQueueData - Début');
    
    try {
      // Import des modèles avec vérification
      console.log('[DEBUG] Tentative d\'import des modèles...');
      const { Ticket, Agence, Service } = require('../models');
      
      console.log('[DEBUG] Modèles importés:', {
        Ticket: !!Ticket,
        Agence: !!Agence,
        Service: !!Service
      });

      if (!Ticket) {
        throw new Error('Modèle Ticket non disponible');
      }

      // Définition de la période (aujourd'hui) - utiliser UTC explicite
      const now = new Date();
      const dateString = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
      const today = new Date(`${dateString}T00:00:00.000Z`);
      const tomorrow = new Date(`${dateString}T00:00:00.000Z`);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      console.log('[DEBUG] Période recherchée:', {
        today: today.toISOString(),
        tomorrow: tomorrow.toISOString()
      });

      // Récupération des tickets avec log de débogage pour la table
      console.log('[DEBUG] Recherche des tickets - requête SQL...');
      console.log('[DEBUG] Table name from model:', Ticket.tableName);
      
      const tickets = await Ticket.findAll({
        where: {
          created_at: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        attributes: ['id', 'agence', 'service', 'status', 'email', 'heure_arrivee', 'estimation_minutes', 'created_at', 'updated_at'],
        order: [['heure_arrivee', 'ASC']],
        limit: 50,
        raw: true // Ajouter raw pour debug
      });

      console.log('[DEBUG] Tickets trouvés:', tickets.length);
      
      // Si pas de tickets aujourd'hui, chercher les plus récents
      if (tickets.length === 0) {
        console.log('[DEBUG] Aucun ticket aujourd\'hui, recherche des plus récents...');
        const recentTickets = await Ticket.findAll({
          attributes: ['id', 'agence', 'service', 'status', 'email', 'heure_arrivee', 'estimation_minutes', 'created_at', 'updated_at'],
          order: [['created_at', 'DESC']],
          limit: 10,
          raw: true
        });
        console.log('[DEBUG] Tickets récents trouvés:', recentTickets.length);
        tickets.push(...recentTickets);
      }

      // Récupération des agences (utiliser 'active' boolean au lieu de 'statut')
      let agences = [];
      if (Agence) {
        console.log('[DEBUG] Recherche des agences...');
        agences = await Agence.findAll({
          where: { active: true }, // Utiliser 'active' boolean au lieu de 'statut'
          attributes: ['id', 'nom', 'code', 'active']
        });
        console.log('[DEBUG] Agences trouvées:', agences.length);
      }

      // Récupération des services
      let services = [];
      if (Service) {
        console.log('[DEBUG] Recherche des services...');
        services = await Service.findAll({
          where: { statut: 'actif' },
          attributes: ['id', 'nom', 'code', 'statut', 'icone', 'couleur']
        });
        console.log('[DEBUG] Services trouvés:', services.length);
      }

      // Préparation de la réponse
      const response = {
        success: true,
        data: {
          tickets: tickets.map(t => ({
            id: t.id,
            agence: t.agence,
            service: t.service,
            status: t.status,
            email: t.email,
            heure_arrivee: t.heure_arrivee,
            estimation_minutes: t.estimation_minutes,
            createdAt: t.created_at
          })),
          agences: agences.map(a => ({
            id: a.id,
            nom: a.nom,
            code: a.code,
            active: a.active
          })),
          services: services.map(s => ({
            id: s.id,
            nom: s.nom,
            code: s.code,
            statut: s.statut,
            icone: s.icone,
            couleur: s.couleur
          }))
        }
      };

      console.log('[DEBUG] DashboardController.getQueueData - Succès');
      res.json(response);

    } catch (error) {
      console.error('[ERROR] DashboardController.getQueueData:', error);
      console.error('[ERROR] Stack trace:', error.stack);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des données',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  static async getStats(req, res) {
    console.log('[DEBUG] DashboardController.getStats - Début');
    
    try {
      console.log('[DEBUG] Import des modèles...');
      const { Ticket, Agence, Service } = require('../models');
      
      console.log('[DEBUG] Modèles importés pour stats:', {
        Ticket: !!Ticket,
        Agence: !!Agence,
        Service: !!Service
      });

      if (!Ticket) {
        throw new Error('Modèle Ticket non disponible pour les statistiques');
      }

      // Période (aujourd'hui) - utiliser UTC explicite
      const now = new Date();
      const dateString = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
      const today = new Date(`${dateString}T00:00:00.000Z`);
      const tomorrow = new Date(`${dateString}T00:00:00.000Z`);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      console.log('[DEBUG] Calcul des statistiques tickets...');

      // Compter tous les tickets (pas seulement aujourd'hui pour le debug)
      const allTicketsCount = await Ticket.count();
      console.log('[DEBUG] Total tickets en base:', allTicketsCount);

      // Compter les tickets par statut (tous les tickets)
      const allStatusCounts = await Promise.all([
        Ticket.count(), // Total
        Ticket.count({ where: { status: 'en_attente' } }),
        Ticket.count({ where: { status: 'en_cours' } }),
        Ticket.count({ where: { status: 'termine' } })
      ]);

      const [totalAllTickets, allEnAttente, allEnCours, allTermines] = allStatusCounts;
      console.log('[DEBUG] Compteurs tous tickets:', {
        total: totalAllTickets,
        enAttente: allEnAttente,
        enCours: allEnCours,
        termines: allTermines
      });

      // Compter les tickets par statut pour aujourd'hui
      const ticketCounts = await Promise.all([
        Ticket.count({
          where: {
            created_at: { [Op.gte]: today, [Op.lt]: tomorrow }
          }
        }),
        Ticket.count({
          where: {
            created_at: { [Op.gte]: today, [Op.lt]: tomorrow },
            status: 'en_attente'
          }
        }),
        Ticket.count({
          where: {
            created_at: { [Op.gte]: today, [Op.lt]: tomorrow },
            status: 'en_cours'
          }
        }),
        Ticket.count({
          where: {
            created_at: { [Op.gte]: today, [Op.lt]: tomorrow },
            status: 'termine'
          }
        })
      ]);

      const [totalTickets, enAttente, enCours, termines] = ticketCounts;
      
      console.log('[DEBUG] Compteurs tickets:', {
        total: totalTickets,
        enAttente,
        enCours,
        termines
      });

      // Compter les agences et services
      let totalAgences = 0;
      let totalServices = 0;

      if (Agence) {
        totalAgences = await Agence.count({ where: { active: true } }); // Utiliser 'active' boolean
        console.log('[DEBUG] Total agences actives:', totalAgences);
      }

      if (Service) {
        totalServices = await Service.count({ where: { statut: 'actif' } });
        console.log('[DEBUG] Total services actifs:', totalServices);
      }

      const response = {
        success: true,
        data: {
          tickets: {
            total: totalTickets,
            enAttente,
            enCours,
            termines,
            tempsMoyen: 15 // Valeur par défaut pour le moment
          },
          ticketsGlobal: {
            total: totalAllTickets,
            enAttente: allEnAttente,
            enCours: allEnCours,
            termines: allTermines
          },
          agences: {
            total: totalAgences,
            actives: totalAgences
          },
          services: {
            total: totalServices,
            actifs: totalServices
          },
          derniereMiseAJour: new Date().toISOString(),
          periode: {
            debut: today.toISOString(),
            fin: tomorrow.toISOString()
          }
        }
      };

      console.log('[DEBUG] DashboardController.getStats - Succès');
      res.json(response);

    } catch (error) {
      console.error('[ERROR] DashboardController.getStats:', error);
      console.error('[ERROR] Stack trace:', error.stack);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors du calcul des statistiques',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  static async healthCheck(req, res) {
    try {
      console.log('[DEBUG] Health check...');
      const { Ticket, Agence, Service } = require('../models');
      
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        models: {
          Ticket: !!Ticket,
          Agence: !!Agence,
          Service: !!Service
        }
      });
    } catch (error) {
      console.error('[ERROR] Health check failed:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = DashboardControllerDebug;
