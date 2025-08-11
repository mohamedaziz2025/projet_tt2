const { Op } = require('sequelize');

/**
 * Contrôleur pour la gestion des agences
 */
class AgenceController {
  
  /**
   * Récupérer toutes les agences
   */
  static async getAll(req, res) {
    try {
      console.log('[DEBUG] AgenceController.getAll - Début');
      
      // Import dynamique des modèles
      const { Agence } = require('../models');
      
      if (!Agence) {
        console.error('[ERROR] Modèle Agence non disponible');
        return res.status(500).json({
          success: false,
          message: 'Modèle Agence non disponible'
        });
      }

      const agences = await Agence.findAll({
        order: [['nom', 'ASC']]
      });

      console.log('[DEBUG] Agences trouvées:', agences.length);

      res.json({
        success: true,
        data: agences,
        count: agences.length
      });

    } catch (error) {
      console.error('[ERROR] AgenceController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des agences',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Récupérer une agence par ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      console.log('[DEBUG] AgenceController.getById - ID:', id);
      
      const { Agence } = require('../models');
      
      const agence = await Agence.findByPk(id);
      
      if (!agence) {
        return res.status(404).json({
          success: false,
          message: 'Agence non trouvée'
        });
      }

      res.json({
        success: true,
        data: agence
      });

    } catch (error) {
      console.error('[ERROR] AgenceController.getById:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'agence',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Créer une nouvelle agence
   */
  static async create(req, res) {
    try {
      console.log('[DEBUG] AgenceController.create - Données:', req.body);
      
      const { Agence } = require('../models');
      
      const nouvelleAgence = await Agence.create(req.body);

      console.log('[DEBUG] Agence créée avec ID:', nouvelleAgence.id);

      res.status(201).json({
        success: true,
        message: 'Agence créée avec succès',
        data: nouvelleAgence
      });

    } catch (error) {
      console.error('[ERROR] AgenceController.create:', error);
      
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
          message: 'Une agence avec ce nom existe déjà'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'agence',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Mettre à jour une agence
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      console.log('[DEBUG] AgenceController.update - ID:', id, 'Données:', req.body);
      
      const { Agence } = require('../models');
      const { sequelize } = require('../models');
      
      // Vérifier que l'agence existe
      const agence = await Agence.findByPk(id);
      
      if (!agence) {
        return res.status(404).json({
          success: false,
          message: 'Agence non trouvée'
        });
      }

      // Utiliser une requête SQL directe pour éviter les triggers
      const allowedFields = ['nom', 'adresse', 'telephone', 'email', 'horaires_ouverture', 'services_disponibles', 'temps_moyen_service', 'active'];
      const updates = [];
      const values = [];
      
      for (const [key, value] of Object.entries(req.body)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucune donnée valide à mettre à jour'
        });
      }
      
      values.push(id); // Pour la clause WHERE
      
      const query = `UPDATE agences SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
      console.log('[DEBUG] SQL Query:', query, 'Values:', values);
      
      try {
        await sequelize.query(query, {
          replacements: values,
          type: sequelize.QueryTypes.UPDATE
        });
        console.log('[DEBUG] SQL UPDATE executed successfully');
      } catch (sqlError) {
        console.error('[ERROR] SQL UPDATE failed:', sqlError);
        throw sqlError;
      }

      // Récupérer l'agence mise à jour
      let agenceUpdated;
      try {
        agenceUpdated = await Agence.findByPk(id);
        console.log('[DEBUG] Agence récupérée après update:', !!agenceUpdated);
      } catch (findError) {
        console.error('[ERROR] Failed to fetch updated agence:', findError);
        throw findError;
      }

      console.log('[DEBUG] Agence mise à jour avec SQL direct:', id);

      res.json({
        success: true,
        message: 'Agence mise à jour avec succès',
        data: agenceUpdated
      });

    } catch (error) {
      console.error('[ERROR] AgenceController.update:', error);
      
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
        message: 'Erreur lors de la mise à jour de l\'agence',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Supprimer une agence
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      console.log('[DEBUG] AgenceController.delete - ID:', id);
      
      const { Agence } = require('../models');
      
      const agence = await Agence.findByPk(id);
      
      if (!agence) {
        return res.status(404).json({
          success: false,
          message: 'Agence non trouvée'
        });
      }

      await agence.destroy();

      console.log('[DEBUG] Agence supprimée:', id);

      res.json({
        success: true,
        message: 'Agence supprimée avec succès'
      });

    } catch (error) {
      console.error('[ERROR] AgenceController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'agence',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  /**
   * Rechercher des agences
   */
  static async search(req, res) {
    try {
      const { q } = req.query;
      console.log('[DEBUG] AgenceController.search - Query:', q);
      
      const { Agence } = require('../models');
      
      const whereClause = {};
      
      if (q) {
        whereClause[Op.or] = [
          { nom: { [Op.like]: `%${q}%` } },
          { adresse: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ];
      }

      const agences = await Agence.findAll({
        where: whereClause,
        order: [['nom', 'ASC']]
      });

      res.json({
        success: true,
        data: agences,
        count: agences.length
      });

    } catch (error) {
      console.error('[ERROR] AgenceController.search:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }
}

module.exports = AgenceController;
