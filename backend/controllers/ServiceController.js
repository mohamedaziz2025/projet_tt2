const { Op } = require('sequelize');

/**
 * Contrôleur pour la gestion des services
 */
class ServiceController {
  
  /**
   * Récupérer tous les services
   */
  static async getAll(req, res) {
    try {
      console.log('[DEBUG] ServiceController.getAll - Début');
      
      // Import dynamique des modèles
      const { Service } = require('../models');
      
      if (!Service) {
        console.error('[ERROR] Modèle Service non disponible');
        return res.status(500).json({
          success: false,
          message: 'Modèle Service non disponible'
        });
      }

      const services = await Service.findAll({
        order: [['nom', 'ASC']]
      });

      console.log('[DEBUG] Services trouvés:', services.length);

      res.json({
        success: true,
        data: services,
        count: services.length
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des services',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Récupérer un service par ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      console.log('[DEBUG] ServiceController.getById - ID:', id);
      
      const { Service } = require('../models');
      
      const service = await Service.findByPk(id);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service non trouvé'
        });
      }

      res.json({
        success: true,
        data: service
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.getById:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du service',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Créer un nouveau service
   */
  static async create(req, res) {
    try {
      console.log('[DEBUG] ServiceController.create - Données:', req.body);
      
      const { Service } = require('../models');
      
      const nouveauService = await Service.create(req.body);

      console.log('[DEBUG] Service créé avec ID:', nouveauService.id);

      res.status(201).json({
        success: true,
        message: 'Service créé avec succès',
        data: nouveauService
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.create:', error);
      
      // Gestion des erreurs de validation Sequelize
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Un service avec ce nom existe déjà'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du service',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Mettre à jour un service
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      console.log('[DEBUG] ServiceController.update - ID:', id, 'Données:', req.body);
      
      const { Service } = require('../models');
      
      const service = await Service.findByPk(id);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service non trouvé'
        });
      }

      await service.update(req.body);

      console.log('[DEBUG] Service mis à jour:', id);

      res.json({
        success: true,
        message: 'Service mis à jour avec succès',
        data: service
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.update:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du service',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Supprimer un service
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      console.log('[DEBUG] ServiceController.delete - ID:', id);
      
      const { Service } = require('../models');
      
      const service = await Service.findByPk(id);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service non trouvé'
        });
      }

      await service.destroy();

      console.log('[DEBUG] Service supprimé:', id);

      res.json({
        success: true,
        message: 'Service supprimé avec succès'
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du service',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Rechercher des services
   */
  static async search(req, res) {
    try {
      const { q } = req.query;
      console.log('[DEBUG] ServiceController.search - Query:', q);
      
      const { Service } = require('../models');
      
      const whereClause = {};
      
      if (q) {
        whereClause[Op.or] = [
          { nom: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } }
        ];
      }

      const services = await Service.findAll({
        where: whereClause,
        order: [['nom', 'ASC']]
      });

      res.json({
        success: true,
        data: services,
        count: services.length
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.search:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Obtenir les services actifs seulement
   */
  static async getActive(req, res) {
    try {
      console.log('[DEBUG] ServiceController.getActive - Début');
      
      const { Service } = require('../models');
      
      const services = await Service.findAll({
        where: {
          active: true
        },
        order: [['nom', 'ASC']]
      });

      res.json({
        success: true,
        data: services,
        count: services.length
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.getActive:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des services actifs',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }
}

module.exports = ServiceController;
