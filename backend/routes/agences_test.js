const express = require('express');
const router = express.Router();

// Test simple pour les agences
router.get('/', async (req, res) => {
  try {
    console.log('[DEBUG] Test route agences - Début');
    
    // Import direct des modèles
    const { Agence } = require('../models');
    
    console.log('[DEBUG] Modèle Agence chargé:', !!Agence);
    
    if (!Agence) {
      return res.status(500).json({
        success: false,
        message: 'Modèle Agence non disponible'
      });
    }

    // Test de récupération simple
    const agences = await Agence.findAll({
      limit: 10
    });

    console.log('[DEBUG] Agences trouvées:', agences ? agences.length : 0);

    res.json({
      success: true,
      data: agences || [],
      count: agences ? agences.length : 0,
      message: 'Test réussi'
    });

  } catch (error) {
    console.error('[ERROR] Test route agences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de test',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
