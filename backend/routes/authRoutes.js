const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes publiques
router.post('/login', authController.login);

// Routes sans authentification JWT (simplifiées)
router.get('/profile', authController.getProfile);
router.post('/logout', authController.logout);

module.exports = router;
