const mysql = require('mysql2/promise');

// Configuration de connexion MySQL directe
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'queue_management'
};

/**
 * Contrôleur Service avec SQL direct - Vérification des champs
 */
class ServiceSQLController {

  /**
   * Créer une connexion MySQL
   */
  static async getConnection() {
    return await mysql.createConnection(dbConfig);
  }

  /**
   * Vérifier la structure de la table services
   */
  static async checkTableStructure(req, res) {
    let connection;
    try {
      console.log('[SQL] 🔍 Vérification structure table services...');
      
      connection = await this.getConnection();
      
      // Récupérer la structure de la table
      const [columns] = await connection.execute('DESCRIBE services');
      
      console.log('[SQL] Structure de la table services:');
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });

      // Vérifier le contenu existant
      const [services] = await connection.execute('SELECT * FROM services LIMIT 5');
      
      console.log('[SQL] Services existants:', services.length);
      
      res.json({
        success: true,
        message: 'Structure de la table services',
        structure: columns.map(col => ({
          field: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          key: col.Key,
          default: col.Default
        })),
        sampleData: services
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.checkTableStructure:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de la structure',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * Récupérer tous les services
   */
  static async getAll(req, res) {
    let connection;
    try {
      console.log('[SQL] ServiceController.getAll - Récupération services...');
      
      connection = await this.getConnection();
      
      const [services] = await connection.execute(`
        SELECT id, nom, description, duree_moyenne, active, 
               created_at, updated_at
        FROM services 
        ORDER BY nom ASC
      `);

      console.log('[SQL] Services trouvés:', services.length);

      res.json({
        success: true,
        data: services,
        total: services.length
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des services',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * Créer un nouveau service
   */
  static async create(req, res) {
    let connection;
    try {
      console.log('[SQL] ServiceController.create - Données:', req.body);
      
      const { nom, description, duree_moyenne } = req.body;

      // Validation des champs requis
      if (!nom) {
        return res.status(400).json({
          success: false,
          message: 'Le nom du service est requis'
        });
      }

      connection = await this.getConnection();

      // Insérer le nouveau service
      const [result] = await connection.execute(`
        INSERT INTO services (nom, description, duree_moyenne, active, created_at, updated_at) 
        VALUES (?, ?, ?, true, NOW(), NOW())
      `, [nom, description || '', duree_moyenne || 15]);

      const serviceId = result.insertId;
      console.log('[SQL] Service créé avec ID:', serviceId);

      // Récupérer le service créé
      const [newService] = await connection.execute(
        'SELECT * FROM services WHERE id = ?',
        [serviceId]
      );

      res.status(201).json({
        success: true,
        message: 'Service créé avec succès',
        data: newService[0]
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.create:', error);
      
      // Gestion des erreurs de contrainte unique
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Un service avec ce nom existe déjà'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du service',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * Mettre à jour un service - VERSION SQL PURE
   */
  static async update(req, res) {
    let connection;
    try {
      const { id } = req.params;
      console.log('[SQL] ServiceController.update - ID:', id, 'Données:', req.body);
      
      connection = await this.getConnection();
      
      // Vérifier que le service existe
      const [existingServices] = await connection.execute(
        'SELECT * FROM services WHERE id = ?',
        [id]
      );

      if (existingServices.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Service non trouvé'
        });
      }

      // Construire la requête de mise à jour dynamiquement
      const allowedFields = ['nom', 'description', 'duree_moyenne', 'active'];
      const updates = [];
      const values = [];
      
      for (const [key, value] of Object.entries(req.body)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucune donnée valide à mettre à jour'
        });
      }
      
      values.push(id); // Pour la clause WHERE
      
      const query = `UPDATE services SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
      console.log('[SQL] Requête de mise à jour:', query, 'Valeurs:', values);
      
      const [updateResult] = await connection.execute(query, values);
      console.log('[SQL] Mise à jour réussie - Rows affected:', updateResult.affectedRows);

      // Récupérer le service mis à jour
      const [updatedService] = await connection.execute(
        'SELECT * FROM services WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Service mis à jour avec succès',
        data: updatedService[0]
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.update:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Un service avec ce nom existe déjà'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du service',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * Supprimer un service
   */
  static async delete(req, res) {
    let connection;
    try {
      const { id } = req.params;
      console.log('[SQL] ServiceController.delete - ID:', id);
      
      connection = await this.getConnection();
      
      // Vérifier s'il y a des tickets liés à ce service
      const [linkedTickets] = await connection.execute(
        'SELECT COUNT(*) as count FROM tickets WHERE service = (SELECT nom FROM services WHERE id = ?)',
        [id]
      );

      if (linkedTickets[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: `Impossible de supprimer le service: ${linkedTickets[0].count} tickets sont liés à ce service`
        });
      }
      
      const [result] = await connection.execute(
        'DELETE FROM services WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Service non trouvé'
        });
      }

      console.log('[SQL] Service supprimé');

      res.json({
        success: true,
        message: 'Service supprimé avec succès'
      });

    } catch (error) {
      console.error('[ERROR] ServiceController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du service',
        error: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
}

module.exports = ServiceSQLController;
