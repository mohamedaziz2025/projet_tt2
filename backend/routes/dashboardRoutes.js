const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const DashboardControllerDebug = require('../controllers/DashboardControllerDebug');
const testController = require('../controllers/testController');
const simpleController = require('../controllers/simpleController');
const TicketSQLController = require('../controllers/TicketSQLController');
const MySQLTestController = require('../controllers/MySQLTestController');
const ServiceSQLController = require('../controllers/ServiceSQLController');
const { sendManualNotification } = require('../services/ticketService');
const { Ticket } = require('../models');

// Routes de test MySQL
router.get('/test-mysql', MySQLTestController.testMySQLConnection);
router.put('/test-mysql/:id/status', MySQLTestController.testSimpleUpdate);

// Route simple pour mise à jour de ticket
router.put('/simple-ticket/:id/status', simpleController.simpleUpdateTicket);

// ⚡ ROUTE PRINCIPALE - Mise à jour ticket avec SQL pur
router.put('/tickets/:id/status', TicketSQLController.updateStatus);

// 🛎️ ROUTES SERVICES AVEC MAPPING - Test direct
router.get('/services-test', ServiceSQLController.checkTableStructure);
router.get('/services-mapped', async (req, res) => {
  try {
    // Simuler req/res pour getAll
    const mockReq = {};
    const mockRes = {
      json: (data) => res.json(data),
      status: (code) => ({ json: (data) => res.status(code).json(data) })
    };
    await ServiceSQLController.getAll(mockReq, mockRes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de test pour mise à jour de ticket
router.put('/test-ticket/:id/status', testController.testUpdateTicket);

// Routes de debug pour tester les nouvelles fonctionnalités
router.get('/queue-debug', DashboardControllerDebug.getQueueData);
router.get('/stats-debug', DashboardControllerDebug.getStats);
router.get('/health', DashboardControllerDebug.healthCheck);

// Routes du dashboard originales
router.get('/queue', dashboardController.getQueue); 
router.get('/stats', dashboardController.getDayStats);
// router.put('/tickets/:id/status', simpleController.simpleUpdateTicket); // ⚡ REMPLACÉ PAR SQL PUR CI-DESSUS
router.post('/call-next', dashboardController.callNextTicket);
router.get('/export', dashboardController.exportCSV);

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

// Route pour notification d'approche
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
