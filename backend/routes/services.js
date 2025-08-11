const express = require('express');
const router = express.Router();
const ServiceDirectController = require('../controllers/ServiceDirectController');

console.log('🛎️  Chargement des routes services (champs SQL directs)...');

// Routes CRUD avec champs SQL directs (sans mapping)
router.get('/', ServiceDirectController.getAll);
router.get('/:id', ServiceDirectController.getById);
router.post('/', ServiceDirectController.create);
router.put('/:id', ServiceDirectController.update);
router.put('/:id/status', ServiceDirectController.updateStatus);
router.delete('/:id', ServiceDirectController.delete);

console.log('✅ Routes services configurées (SQL direct)');

module.exports = router;
