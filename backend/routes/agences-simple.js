const express = require('express');
const router = express.Router();

// GET /api/agences - Version simplifiée sans associations complexes
router.get('/', async (req, res) => {
  try {
    console.log('📋 Route GET /agences - Version simplifiée');
    
    const { Agence } = require('../models');
    
    if (!Agence) {
      console.log('❌ Modèle Agence non disponible');
      return res.status(500).json({ 
        error: 'Modèle Agence non disponible' 
      });
    }

    console.log('✅ Modèle Agence disponible');
    
    // Récupérer toutes les agences sans associations complexes
    const agences = await Agence.findAll({
      attributes: ['id', 'nom', 'code', 'adresse', 'ville', 'telephone', 'statut'],
      order: [['nom', 'ASC']],
      limit: 50
    });

    console.log(`✅ ${agences.length} agences trouvées`);

    const response = {
      agences: agences.map(agence => ({
        id: agence.id,
        nom: agence.nom,
        code: agence.code,
        adresse: agence.adresse,
        ville: agence.ville,
        telephone: agence.telephone,
        statut: agence.statut,
        statistiques: {
          totalTickets: 0,
          ticketsActifs: 0,
          capaciteRestante: agence.capaciteMax || 50,
          tauxOccupation: 0,
          estOuverte: true
        }
      })),
      pagination: {
        page: 1,
        limite: 50,
        total: agences.length,
        pages: 1
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Erreur route /agences:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des agences',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// GET /api/agences/statistiques - Version simplifiée
router.get('/statistiques', async (req, res) => {
  try {
    const { Agence } = require('../models');
    
    if (!Agence) {
      return res.status(500).json({ error: 'Modèle Agence non disponible' });
    }

    const total = await Agence.count();
    const actives = await Agence.count({ where: { statut: 'active' } }); // Correction: 'active' au lieu de 'actif'
    
    res.json({
      total,
      actives,
      enMaintenance: 0,
      fermees: total - actives,
      capaciteTotale: total * 50, // Estimation
      tauxActivite: total > 0 ? Math.round((actives / total) * 100) : 0,
      repartitionVilles: {}
    });
  } catch (error) {
    console.error('❌ Erreur statistiques agences:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des statistiques' 
    });
  }
});

// POST /api/agences - Créer une agence (version simplifiée)
router.post('/', async (req, res) => {
  try {
    console.log('[DEBUG] POST /agences - Données reçues:', req.body);
    
    const { nom, code, adresse, ville, codePostal, telephone, email, manager, capaciteMax } = req.body;

    // Validation des champs requis
    if (!nom || !code || !adresse || !ville || !codePostal || !telephone) {
      console.log('[DEBUG] Champs manquants:', { nom: !!nom, code: !!code, adresse: !!adresse, ville: !!ville, codePostal: !!codePostal, telephone: !!telephone });
      return res.status(400).json({ 
        error: 'Les champs nom, code, adresse, ville, codePostal et telephone sont requis' 
      });
    }

    const { Agence } = require('../models');
    
    // Vérifier l'unicité du code
    const existingAgence = await Agence.findOne({ where: { code: code.trim().toUpperCase() } });
    if (existingAgence) {
      return res.status(400).json({ 
        error: 'Une agence avec ce code existe déjà' 
      });
    }
    
    const nouvelleAgence = await Agence.create({
      nom: nom.trim(),
      code: code.trim().toUpperCase(),
      adresse: adresse.trim(),
      ville: ville.trim(),
      codePostal: codePostal.trim(),
      telephone: telephone.trim(),
      email: email ? email.trim() : null,
      manager: manager ? manager.trim() : null,
      statut: 'active',
      capaciteMax: capaciteMax || 50
    });

    console.log('[DEBUG] Nouvelle agence créée:', nouvelleAgence.id);

    res.status(201).json({
      message: 'Agence créée avec succès',
      agence: nouvelleAgence
    });
  } catch (error) {
    console.error('❌ Erreur création agence:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Une agence avec ce code existe déjà' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de l\'agence' 
    });
  }
});

module.exports = router;
