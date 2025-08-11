const express = require('express');
const router = express.Router();
const TicketSQLController = require('../controllers/TicketSQLController');

console.log('📋 Chargement des routes tickets SQL...');

// Routes principales avec SQL direct
router.get('/', TicketSQLController.getAll);
router.get('/:id', TicketSQLController.getById);
router.post('/', TicketSQLController.create);
router.put('/:id/status', TicketSQLController.updateStatus); // ⚡ ROUTE PRINCIPALE POUR UPDATE STATUS
router.delete('/:id', TicketSQLController.delete);

console.log('✅ Routes tickets SQL configurées');

module.exports = router;
