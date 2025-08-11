const express = require('express');
const router = express.Router();
const ServiceSQLController = require('../controllers/ServiceSQLController');

console.log('🛠️ Chargement des routes services SQL...');

// Route de vérification de structure
router.get('/check-structure', ServiceSQLController.checkTableStructure);

// Routes principales avec SQL direct
router.get('/', ServiceSQLController.getAll);
router.post('/', ServiceSQLController.create);
router.put('/:id', ServiceSQLController.update);
router.delete('/:id', ServiceSQLController.delete);

console.log('✅ Routes services SQL configurées');

module.exports = router;
