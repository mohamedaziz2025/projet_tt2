const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/ServiceController');

// Utiliser le contrôleur pour toutes les routes
router.get('/', ServiceController.getAll);
router.get('/search', ServiceController.search);
router.get('/categories', ServiceController.getCategories);
router.get('/:id', ServiceController.getById);
router.post('/', ServiceController.create);
router.put('/:id', ServiceController.update);
router.delete('/:id', ServiceController.delete);

module.exports = router;
