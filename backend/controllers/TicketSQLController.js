const mysql = require('mysql2/promise');

// Configuration de connexion MySQL directe
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'queue_management'
};

/**
 * Contrôleur Ticket avec SQL direct - Sans Sequelize
 */
class TicketSQLController {

  /**
   * Créer une connexion MySQL
   */
  static async getConnection() {
    return await mysql.createConnection(dbConfig);
  }

  /**
   * Récupérer tous les tickets
   */
  static async getAll(req, res) {
    let connection;
    try {
      console.log('[SQL] TicketController.getAll - Récupération tickets...');
      
      connection = await this.getConnection();
      
      const [tickets] = await connection.execute(`
        SELECT id, agence, service, nom_client, telephone, email, 
               status, numero_ticket, position_actuelle, estimation_minutes,
               heure_arrivee, created_at, updated_at
        FROM tickets 
        ORDER BY id DESC 
        LIMIT 50
      `);

      console.log('[SQL] Tickets trouvés:', tickets.length);

      res.json({
        success: true,
        data: tickets,
        total: tickets.length
      });

    } catch (error) {
      console.error('[ERROR] TicketController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des tickets',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * Récupérer un ticket par ID
   */
  static async getById(req, res) {
    let connection;
    try {
      const { id } = req.params;
      console.log('[SQL] TicketController.getById - ID:', id);
      
      connection = await this.getConnection();
      
      const [tickets] = await connection.execute(
        'SELECT * FROM tickets WHERE id = ?',
        [id]
      );

      if (tickets.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ticket non trouvé'
        });
      }

      res.json({
        success: true,
        data: tickets[0]
      });

    } catch (error) {
      console.error('[ERROR] TicketController.getById:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du ticket',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * Créer un nouveau ticket
   */
  static async create(req, res) {
    let connection;
    try {
      console.log('[SQL] TicketController.create - Données:', req.body);
      
      const { agence, service, nom_client, telephone, email } = req.body;

      // Validation des champs requis
      if (!agence || !service || !nom_client || !email) {
        return res.status(400).json({
          success: false,
          message: 'Champs manquants: agence, service, nom_client, email sont requis'
        });
      }

      connection = await this.getConnection();
      
      // Supprimer le trigger problématique avant toute opération
      await connection.execute('DROP TRIGGER IF EXISTS update_queue_position');
      console.log('[SQL] Trigger supprimé pour la création');

      // Générer le numéro de ticket et la position
      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM tickets WHERE DATE(created_at) = CURDATE()'
      );
      const dailyCount = countResult[0].total + 1;
      const numeroTicket = `A-${dailyCount.toString().padStart(3, '0')}`;
      
      const [queueResult] = await connection.execute(
        'SELECT COUNT(*) as position FROM tickets WHERE agence = ? AND status = "en_attente"',
        [agence]
      );
      const positionActuelle = queueResult[0].position + 1;

      // Insérer le nouveau ticket
      const [result] = await connection.execute(`
        INSERT INTO tickets (
          agence, service, nom_client, telephone, email, 
          status, numero_ticket, position_actuelle, 
          estimation_minutes, heure_arrivee, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'en_attente', ?, ?, 15, NOW(), NOW(), NOW())
      `, [agence, service, nom_client, telephone, email, numeroTicket, positionActuelle]);

      const ticketId = result.insertId;
      console.log('[SQL] Ticket créé avec ID:', ticketId);

      // Récupérer le ticket créé
      const [newTicket] = await connection.execute(
        'SELECT * FROM tickets WHERE id = ?',
        [ticketId]
      );

      res.status(201).json({
        success: true,
        message: 'Ticket créé avec succès',
        data: newTicket[0]
      });

    } catch (error) {
      console.error('[ERROR] TicketController.create:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du ticket',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * Mettre à jour le statut d'un ticket - VERSION SQL PURE
   */
  static async updateStatus(req, res) {
    let connection;
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      console.log('[SQL] ⚡ Update ticket status - ID:', id, 'Status:', status);

      // Validation du statut
      const validStatuses = ['en_attente', 'en_cours', 'termine', 'annule'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide. Valeurs acceptées: ' + validStatuses.join(', ')
        });
      }

      connection = await this.getConnection();
      
      // 1. Vérifier que le ticket existe
      const [existingTickets] = await connection.execute(
        'SELECT id, status, agence FROM tickets WHERE id = ?',
        [id]
      );

      if (existingTickets.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ticket non trouvé'
        });
      }

      const currentTicket = existingTickets[0];
      console.log('[SQL] Ticket trouvé - Status actuel:', currentTicket.status);

      // 2. Supprimer le trigger problématique (utilisé query au lieu d'execute pour DDL)
      await connection.query('DROP TRIGGER IF EXISTS update_queue_position');
      console.log('[SQL] ✅ Trigger supprimé');

      // 3. Mise à jour directe avec SQL
      const [updateResult] = await connection.execute(
        'UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      console.log('[SQL] ✅ Mise à jour réussie - Rows affected:', updateResult.affectedRows);

      // 4. Récupérer le ticket mis à jour
      const [updatedTickets] = await connection.execute(
        'SELECT * FROM tickets WHERE id = ?',
        [id]
      );

      const updatedTicket = updatedTickets[0];
      console.log('[SQL] ✅ Status final:', updatedTicket.status);

      res.json({
        success: true,
        message: 'Statut du ticket mis à jour avec succès',
        data: {
          id: updatedTicket.id,
          oldStatus: currentTicket.status,
          newStatus: updatedTicket.status,
          ticket: updatedTicket
        }
      });

    } catch (error) {
      console.error('[ERROR] ❌ TicketController.updateStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du statut',
        error: error.message,
        code: error.code,
        errno: error.errno
      });
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * Supprimer un ticket
   */
  static async delete(req, res) {
    let connection;
    try {
      const { id } = req.params;
      console.log('[SQL] TicketController.delete - ID:', id);
      
      connection = await this.getConnection();
      
      // Supprimer le trigger avant suppression
      await connection.execute('DROP TRIGGER IF EXISTS update_queue_position');
      
      const [result] = await connection.execute(
        'DELETE FROM tickets WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ticket non trouvé'
        });
      }

      console.log('[SQL] Ticket supprimé');

      res.json({
        success: true,
        message: 'Ticket supprimé avec succès'
      });

    } catch (error) {
      console.error('[ERROR] TicketController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du ticket',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
}

module.exports = TicketSQLController;
