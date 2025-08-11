const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const DashboardControllerDebug = require('../controllers/DashboardControllerDebug');
const testController = require('../controllers/testController');
const { sendManualNotification } = require('../services/ticketService');
const { Ticket } = require('../models');

// Routes de test
router.put('/test-ticket/:id/status', testController.testUpdateTicket);

// Routes de test avec le nouveau contrôleur
router.get('/queue-debug', DashboardControllerDebug.getQueueData);
router.get('/stats-debug', DashboardControllerDebug.getStats);
router.get('/health', DashboardControllerDebug.healthCheck);

// Routes originales (priorité à l'ancien contrôleur)
router.get('/queue', DashboardController.getQueue);
router.get('/stats', DashboardController.getDayStats);
router.put('/tickets/:id/status', DashboardController.updateTicketStatus);

// Route pour notifications manuelles
router.post('/notify/:ticketId', async (req, res) => {
  console.log('📧 Demande notification manuelle pour ticket:', req.params.ticketId);
  
  try {
    const ticketId = req.params.ticketId;
    const { message } = req.body;
    
    // Récupérer le ticket
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }
    
    console.log('🎫 Ticket trouvé:', {
      id: ticket.id,
      email: ticket.email,
      status: ticket.status,
      agence: ticket.agence,
      service: ticket.service
    });
    
    // Envoyer la notification
    const emailSent = await sendManualNotification(ticket, message);
    
    if (emailSent) {
      res.json({
        success: true,
        message: `Notification envoyée avec succès à ${ticket.email}`,
        ticketNumber: `A-${ticket.id.toString().padStart(3, '0')}`,
        email: ticket.email
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de la notification',
        error: 'Configuration email manquante ou erreur SMTP'
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur notification manuelle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi de la notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Route pour notification d'approche (existante mais améliorée)
router.post('/notify-approach/:ticketId', async (req, res) => {
  console.log('🔔 Demande notification d\'approche pour ticket:', req.params.ticketId);
  
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }
    
    if (ticket.status !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Seuls les tickets en attente peuvent recevoir des notifications d\'approche',
        currentStatus: ticket.status
      });
    }
    
    // Utiliser le service de notification automatique
    const notificationService = require('../services/notificationService');
    const emailSent = await notificationService.forceNotification(ticketId);
    
    if (emailSent) {
      res.json({
        success: true,
        message: `Notification d'approche envoyée à ${ticket.email}`,
        ticketNumber: `A-${ticket.id.toString().padStart(3, '0')}`,
        email: ticket.email
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de la notification d\'approche'
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur notification d\'approche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

module.exports = router;
