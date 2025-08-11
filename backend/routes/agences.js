const express = require('express');
const router = express.Router();

// GET /api/agences - Récupérer toutes les agences
router.get('/', async (req, res) => {
  try {
    console.log('[DEBUG] Route agences appelée');
    
    // Import des modèles
    const { Agence } = require('../models');
    
    if (!Agence) {
      console.error('[ERROR] Modèle Agence non disponible');
      return res.status(500).json({
        error: 'Modèle Agence non disponible'
      });
    }

    // Récupérer toutes les agences
    const agences = await Agence.findAll({
      order: [['nom', 'ASC']]
    });

    console.log('[DEBUG] Agences trouvées:', agences.length);

    // Transformer les données pour le frontend
    const agencesFormatees = agences.map(agence => {
      const agenceData = agence.toJSON();
      
      // Extraire les horaires de la semaine (lundi-vendredi)
      const heuresOuverture = agenceData.heuresOuverture || {};
      let horairesOuverture = '8h00-17h00'; // Valeur par défaut
      let horairesFermeture = '17h00'; // Valeur par défaut
      
      // Utiliser les horaires du lundi comme référence
      if (heuresOuverture.lundi) {
        horairesOuverture = heuresOuverture.lundi.debut || '8h00';
        horairesFermeture = heuresOuverture.lundi.fin || '17h00';
      }
      
      return {
        ...agenceData,
        horairesOuverture,
        horairesFermeture,
        // Garder aussi les heures complètes pour les détails
        detailsHoraires: heuresOuverture
      };
    });

    // Format compatible avec le frontend existant
    res.json(agencesFormatees);

  } catch (error) {
    console.error('[ERROR] Route agences:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des agences'
    });
  }
});

// POST /api/agences - Créer une nouvelle agence
router.post('/', async (req, res) => {
  try {
    console.log('[DEBUG] Création agence:', req.body);
    
    const { Agence } = require('../models');
    
    // Générer automatiquement les champs requis manquants
    let agenceData = { ...req.body };
    
    // Générer un code automatiquement si pas fourni
    if (!agenceData.code) {
      const nom = agenceData.nom || 'AGENCE';
      const codeBase = nom.toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6);
      
      // Ajouter un timestamp pour l'unicité
      const timestamp = Date.now().toString().slice(-4);
      agenceData.code = `${codeBase}${timestamp}`;
    }
    
    // Ajouter un code postal par défaut si manquant
    if (!agenceData.codePostal) {
      agenceData.codePostal = '0000'; // Code postal par défaut
    }

    // Transformer les horaires pour la base de données
    if (agenceData.horairesOuverture && agenceData.horairesFermeture) {
      agenceData.heuresOuverture = JSON.stringify({
        lundi: { ouverture: agenceData.horairesOuverture, fermeture: agenceData.horairesFermeture },
        mardi: { ouverture: agenceData.horairesOuverture, fermeture: agenceData.horairesFermeture },
        mercredi: { ouverture: agenceData.horairesOuverture, fermeture: agenceData.horairesFermeture },
        jeudi: { ouverture: agenceData.horairesOuverture, fermeture: agenceData.horairesFermeture },
        vendredi: { ouverture: agenceData.horairesOuverture, fermeture: agenceData.horairesFermeture },
        samedi: { ouverture: agenceData.horairesOuverture, fermeture: agenceData.horairesFermeture },
        dimanche: { ferme: true }
      });
      
      // Supprimer les champs temporaires du frontend
      delete agenceData.horairesOuverture;
      delete agenceData.horairesFermeture;
    }

    // Standardiser le statut
    if (agenceData.status) {
      agenceData.statut = agenceData.status;
      delete agenceData.status;
    }

    console.log('[DEBUG] Agence data avec code:', agenceData);
    
    const nouvelleAgence = await Agence.create(agenceData);
    
    res.status(201).json({
      message: 'Agence créée avec succès',
      agence: nouvelleAgence
    });

  } catch (error) {
    console.error('[ERROR] Création agence:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'agence',
      details: error.message
    });
  }
});

// GET /api/agences/:id - Récupérer une agence spécifique
router.get('/:id', async (req, res) => {
  try {
    const { Agence } = require('../models');
    
    const agence = await Agence.findByPk(req.params.id);
    
    if (!agence) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }

    res.json(agence);

  } catch (error) {
    console.error('[ERROR] Récupération agence:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'agence'
    });
  }
});

// PUT /api/agences/:id - Modifier une agence
router.put('/:id', async (req, res) => {
  try {
    const { Agence } = require('../models');
    
    const agence = await Agence.findByPk(req.params.id);
    
    if (!agence) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }

    await agence.update(req.body);

    res.json({
      message: 'Agence mise à jour avec succès',
      agence
    });

  } catch (error) {
    console.error('[ERROR] Mise à jour agence:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de l\'agence'
    });
  }
});

// DELETE /api/agences/:id - Supprimer une agence
router.delete('/:id', async (req, res) => {
  try {
    const { Agence } = require('../models');
    
    const agence = await Agence.findByPk(req.params.id);
    
    if (!agence) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }

    await agence.destroy();

    res.json({
      message: 'Agence supprimée avec succès'
    });

  } catch (error) {
    console.error('[ERROR] Suppression agence:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de l\'agence'
    });
  }
});

// PATCH /api/agences/:id/status - Modifier le statut d'une agence
router.patch('/:id/status', async (req, res) => {
  try {
    const { statut } = req.body;
    const { Agence } = require('../models');
    
    const agence = await Agence.findByPk(req.params.id);
    
    if (!agence) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }

    await agence.update({ statut });

    res.json({
      message: 'Statut modifié avec succès',
      agence
    });

  } catch (error) {
    console.error('[ERROR] Modification statut:', error);
    res.status(500).json({
      error: 'Erreur lors de la modification du statut'
    });
  }
});

module.exports = router;
