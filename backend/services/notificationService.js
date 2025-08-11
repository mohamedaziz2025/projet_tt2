const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const { Ticket } = require('../models');
const { sendApproachNotification } = require('./ticketService');
const { Op } = require('sequelize');

// Service de notifications automatiques
class NotificationService {
  constructor() {
    this.notifiedTickets = new Set(); // Pour éviter les doublons
    this.startNotificationScheduler();
  }

  // Démarrer le planificateur de notifications
  startNotificationScheduler() {
    // Vérifier toutes les 2 minutes
    schedule.scheduleJob('*/2 * * * *', async () => {
      await this.checkAndSendNotifications();
    });
    
    console.log('🔔 Service de notifications automatiques démarré');
  }

  // Vérifier et envoyer les notifications
  async checkAndSendNotifications() {
    try {
      // Récupérer tous les tickets en attente
      const waitingTickets = await Ticket.findAll({
        where: {
          status: 'en_attente'
        },
        order: [['heure_arrivee', 'ASC']]
      });

      if (waitingTickets.length === 0) {
        return;
      }

      // Pour chaque ticket, vérifier s'il faut envoyer une notification
      for (let i = 0; i < waitingTickets.length; i++) {
        const ticket = waitingTickets[i];
        const shouldNotify = this.shouldSendNotification(ticket, i, waitingTickets.length);
        
        if (shouldNotify && !this.notifiedTickets.has(ticket.id)) {
          await sendApproachNotification(ticket);
          this.notifiedTickets.add(ticket.id);
          
          // Marquer le ticket comme notifié (optionnel: ajouter un champ dans la DB)
          console.log(`🔔 Notification envoyée pour le ticket A-${ticket.id.toString().padStart(3, '0')}`);
        }
      }

      // Nettoyer les tickets notifiés qui ne sont plus en attente
      await this.cleanupNotifiedTickets();
      
    } catch (error) {
      console.error('❌ Erreur dans le service de notifications:', error);
    }
  }

  // Déterminer si un ticket doit recevoir une notification
  shouldSendNotification(ticket, position, totalTickets) {
    const now = new Date();
    const ticketTime = new Date(ticket.heure_arrivee);
    const elapsedMinutes = (now - ticketTime) / (1000 * 60);
    
    // Condition 1: Le ticket est dans les 3 premiers de la file
    const isInTopThree = position < 3;
    
    // Condition 2: L'heure estimée approche (5 minutes avant)
    const estimatedCallTime = new Date(ticketTime.getTime() + ticket.estimation_minutes * 60000);
    const minutesUntilEstimatedTime = (estimatedCallTime - now) / (1000 * 60);
    const isTimeApproaching = minutesUntilEstimatedTime <= 5 && minutesUntilEstimatedTime > 0;
    
    // Condition 3: Le ticket attend depuis longtemps (plus de 20 minutes)
    const isWaitingTooLong = elapsedMinutes > 20;
    
    return isInTopThree || isTimeApproaching || isWaitingTooLong;
  }

  // Nettoyer les tickets notifiés qui ne sont plus en attente
  async cleanupNotifiedTickets() {
    try {
      const currentWaitingTickets = await Ticket.findAll({
        where: {
          status: 'en_attente'
        },
        attributes: ['id']
      });

      const currentWaitingIds = new Set(currentWaitingTickets.map(t => t.id));
      
      // Supprimer de la liste les tickets qui ne sont plus en attente
      for (const ticketId of this.notifiedTickets) {
        if (!currentWaitingIds.has(ticketId)) {
          this.notifiedTickets.delete(ticketId);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des notifications:', error);
    }
  }

  // Forcer l'envoi d'une notification (utilisé par l'admin)
  async forceNotification(ticketId) {
    try {
      const ticket = await Ticket.findByPk(ticketId);
      if (ticket && ticket.status === 'en_attente') {
        await sendApproachNotification(ticket);
        this.notifiedTickets.add(ticket.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi forcé:', error);
      return false;
    }
  }

  // Obtenir les statistiques des notifications
  getStats() {
    return {
      notifiedTicketsCount: this.notifiedTickets.size,
      notifiedTickets: Array.from(this.notifiedTickets)
    };
  }
}

// Instance singleton
const notificationService = new NotificationService();

module.exports = notificationService;
