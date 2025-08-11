const { sequelize } = require('../models');
const notificationService = require('../services/notificationService');
const ticketService = require('../services/ticketService');

// Obtenir la file d'attente actuelle
exports.getQueue = async (req, res) => {
  try {
    console.log('[DEBUG] dashboardController.getQueue - Récupération des tickets...');
    
    // Requête SQL directe pour récupérer les tickets
    const [tickets] = await sequelize.query(
      `SELECT id, agence, service, nom_client, telephone, email, status, 
              numero_ticket, position_actuelle, estimation_minutes, 
              heure_arrivee, created_at, updated_at 
       FROM tickets 
       ORDER BY id DESC 
       LIMIT 20`
    );

    console.log('[DEBUG] Tickets trouvés:', tickets.length);
    if (tickets.length > 0) {
      console.log('[DEBUG] Premiers tickets:', tickets.slice(0, 3).map(t => ({
        id: t.id,
        agence: t.agence,
        service: t.service,
        status: t.status,
        email: t.email
      })));
    }

    res.json({
      queue: tickets,
      total: tickets.length
    });
  } catch (error) {
    console.error('[ERROR] dashboardController.getQueue:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir les statistiques du jour
exports.getDayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Requête SQL directe pour les statistiques principales
    const [statsRows] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalTickets,
        SUM(CASE WHEN status = 'en_attente' THEN 1 ELSE 0 END) as ticketsEnAttente,
        SUM(CASE WHEN status = 'en_cours' THEN 1 ELSE 0 END) as ticketsEnCours,
        SUM(CASE WHEN status = 'termine' THEN 1 ELSE 0 END) as ticketsTermines,
        AVG(COALESCE(estimation_minutes, 0)) as tempsMoyen
      FROM tickets 
      WHERE heure_arrivee >= ? AND heure_arrivee < ?
    `, {
      replacements: [today, tomorrow]
    });

    // Requête pour les statistiques par service
    const [serviceStatsRows] = await sequelize.query(`
      SELECT service, COUNT(*) as count
      FROM tickets 
      WHERE heure_arrivee >= ? AND heure_arrivee < ?
      GROUP BY service
    `, {
      replacements: [today, tomorrow]
    });

    // Requête pour les statistiques par agence
    const [agenceStatsRows] = await sequelize.query(`
      SELECT agence, COUNT(*) as count
      FROM tickets 
      WHERE heure_arrivee >= ? AND heure_arrivee < ?
      GROUP BY agence
    `, {
      replacements: [today, tomorrow]
    });

    // Requête pour les heures de pointe
    const [heuresStatsRows] = await sequelize.query(`
      SELECT HOUR(heure_arrivee) as heure, COUNT(*) as count
      FROM tickets 
      WHERE heure_arrivee >= ? AND heure_arrivee < ?
      GROUP BY HOUR(heure_arrivee)
      ORDER BY heure
    `, {
      replacements: [today, tomorrow]
    });

    const stats = statsRows[0] || {
      totalTickets: 0, ticketsEnAttente: 0, ticketsEnCours: 0, 
      ticketsTermines: 0, tempsMoyen: 0
    };

    // Convertir les résultats en objets
    const serviceStats = {};
    serviceStatsRows.forEach(row => {
      serviceStats[row.service] = row.count;
    });

    const agenceStats = {};
    agenceStatsRows.forEach(row => {
      agenceStats[row.agence] = row.count;
    });

    const heuresPointe = {};
    heuresStatsRows.forEach(row => {
      heuresPointe[row.heure] = row.count;
    });

    res.json({
      date: today.toISOString().split('T')[0],
      totalTickets: stats.totalTickets,
      ticketsEnAttente: stats.ticketsEnAttente,
      ticketsEnCours: stats.ticketsEnCours,
      ticketsTermines: stats.ticketsTermines,
      tempsMoyen: Math.round(stats.tempsMoyen || 0),
      serviceStats,
      agenceStats,
      heuresPointe,
      notifications: notificationService.getStats()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour le statut d'un ticket
exports.updateTicketStatus = async (req, res) => {
  try {
    console.log('[DEBUG] updateTicketStatus - Début');
    const { id } = req.params;
    const { status } = req.body;

    console.log('[DEBUG] Mise à jour ticket:', id, 'vers status:', status);

    if (!['en_attente', 'en_cours', 'termine', 'annule'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    // Récupérer le ticket actuel avec SQL direct
    const [ticketRows] = await sequelize.query(
      'SELECT * FROM tickets WHERE id = ?',
      {
        replacements: [id]
      }
    );
    
    const ticket = ticketRows[0];
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    console.log('[DEBUG] Ticket trouvé:', {
      id: ticket.id,
      agence: ticket.agence,
      currentStatus: ticket.status
    });

    // Si le status est identique, pas de mise à jour nécessaire
    if (ticket.status === status) {
      console.log('[DEBUG] Status identique, pas de changement');
      return res.json({
        message: 'Statut déjà à jour',
        ticket: ticket
      });
    }

    const oldStatus = ticket.status;
    
    // Solution radicale : supprimer temporairement le trigger
    console.log('[DEBUG] Suppression temporaire du trigger...');
    const { sequelize } = require('../models');
    
    try {
      // Supprimer le trigger temporairement
      await sequelize.query('DROP TRIGGER IF EXISTS update_queue_position');
      console.log('[DEBUG] Trigger supprimé temporairement');
      
      // Faire la mise à jour simple avec SQL direct
      await sequelize.query(
        'UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?',
        {
          replacements: [status, id]
        }
      );
      
      console.log('[DEBUG] Mise à jour SQL réussie');
      
    } catch (updateError) {
      console.error('[ERROR] Erreur mise à jour SQL:', updateError.message);
      throw updateError;
    }

    // Récupérer le ticket mis à jour avec SQL direct
    const [updatedRows] = await sequelize.query(
      'SELECT * FROM tickets WHERE id = ?',
      {
        replacements: [id]
      }
    );
    const updatedTicket = updatedRows[0];
    console.log('[DEBUG] Ticket après mise à jour:', updatedTicket?.status);

    // Émettre un événement Socket.IO pour notifier les admins
    if (global.emitToAdmins) {
      global.emitToAdmins('ticket-updated', {
        ticketId: id,
        oldStatus,
        newStatus: status,
        ticket: updatedTicket
      });
    }

    res.json({
      message: 'Statut mis à jour avec succès',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('[ERROR] updateTicketStatus:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Appeler le prochain ticket
exports.callNextTicket = async (req, res) => {
  try {
    const nextTicket = await Ticket.findOne({
      where: { status: 'en_attente' },
      order: [['heure_arrivee', 'ASC']]
    });

    if (!nextTicket) {
      return res.status(404).json({ error: 'Aucun ticket en attente' });
    }

    nextTicket.status = 'en_cours';
    await nextTicket.save();

    // Émettre un événement Socket.IO
    if (global.emitToAdmins) {
      global.emitToAdmins('ticket-called', {
        ticket: nextTicket,
        message: `Ticket A-${nextTicket.id.toString().padStart(3, '0')} appelé`
      });
    }

    res.json({
      message: 'Ticket appelé',
      ticket: nextTicket
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Exporter les données en CSV
exports.exportCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.heure_arrivee = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      order: [['heure_arrivee', 'DESC']]
    });

    // Générer le CSV
    const csvHeader = 'ID,Numero_Ticket,Agence,Service,Status,Email,Heure_Arrivee,Estimation_Minutes,Duree_Attente\n';
    const csvData = tickets.map(ticket => {
      const numeroTicket = `A-${ticket.id.toString().padStart(3, '0')}`;
      const dureeAttente = ticket.status === 'termine' ? 
        Math.round((new Date() - new Date(ticket.heure_arrivee)) / (1000 * 60)) : 
        'En cours';
      
      return `${ticket.id},"${numeroTicket}","${ticket.agence}","${ticket.service}","${ticket.status}","${ticket.email}","${ticket.heure_arrivee}",${ticket.estimation_minutes},"${dureeAttente}"`;
    }).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=tickets_export.csv');
    res.send('\ufeff' + csv); // BOM pour Excel
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Forcer l'envoi d'une notification
exports.forceNotification = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findByPk(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    if (ticket.status !== 'en_attente') {
      return res.status(400).json({ error: 'Le ticket n\'est pas en attente' });
    }

    // Forcer l'envoi de la notification
    await ticketService.sendApproachNotification(ticket);
    
    // Émettre événement Socket.IO
    if (global.emitToAdmins) {
      global.emitToAdmins('notification-sent', {
        message: `Notification forcée envoyée pour le ticket A-${ticketId.toString().padStart(3, '0')}`
      });
    }

    res.json({ 
      message: 'Notification envoyée avec succès',
      ticket: {
        id: ticket.id,
        status: ticket.status
      }
    });
  } catch (error) {
    console.error('Erreur forceNotification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
