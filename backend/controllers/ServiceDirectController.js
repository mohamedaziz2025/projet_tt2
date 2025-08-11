const mysql = require('mysql2/promise');

/**
 * Contrôleur Service avec champs SQL directs - PAS DE MAPPING
 * Utilise exactement les mêmes champs que la DB
 */
class ServiceDirectController {

  static async getConnection() {
    return await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
  }

  // Récupérer tous les services (retour direct DB)
  static async getAll(req, res) {
    let connection;
    try {
      connection = await this.getConnection();
      
      const [services] = await connection.execute('SELECT * FROM services ORDER BY nom');
      
      res.json({
        success: true,
        data: services // Retour direct sans mapping
      });
      
    } catch (error) {
      console.error('❌ Erreur getAll services:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des services',
        details: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // Récupérer un service par ID
  static async getById(req, res) {
    const { id } = req.params;
    let connection;
    
    try {
      connection = await this.getConnection();
      
      const [services] = await connection.execute('SELECT * FROM services WHERE id = ?', [id]);
      
      if (services.length === 0) {
        return res.status(404).json({ error: 'Service non trouvé' });
      }
      
      res.json({
        success: true,
        data: services[0] // Retour direct sans mapping
      });
      
    } catch (error) {
      console.error('❌ Erreur getById service:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération du service',
        details: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // Créer un service
  static async create(req, res) {
    let connection;
    
    try {
      connection = await this.getConnection();
      
      // Utilisation directe des champs du body (même noms que DB)
      const { nom, description, duree_moyenne, active } = req.body;
      
      const [result] = await connection.execute(
        'INSERT INTO services (nom, description, duree_moyenne, active) VALUES (?, ?, ?, ?)',
        [nom, description, duree_moyenne, active]
      );
      
      // Récupérer le service créé
      const [newService] = await connection.execute('SELECT * FROM services WHERE id = ?', [result.insertId]);
      
      res.json({
        success: true,
        message: 'Service créé avec succès',
        data: newService[0] // Retour direct sans mapping
      });
      
    } catch (error) {
      console.error('❌ Erreur create service:', error);
      res.status(500).json({
        error: 'Erreur lors de la création du service',
        details: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // Mettre à jour un service
  static async update(req, res) {
    const { id } = req.params;
    let connection;
    
    try {
      connection = await this.getConnection();
      
      // Utilisation directe des champs du body (même noms que DB)
      const { nom, description, duree_moyenne, active } = req.body;
      
      const [result] = await connection.execute(
        'UPDATE services SET nom = ?, description = ?, duree_moyenne = ?, active = ? WHERE id = ?',
        [nom, description, duree_moyenne, active, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Service non trouvé' });
      }
      
      // Récupérer le service mis à jour
      const [updatedService] = await connection.execute('SELECT * FROM services WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Service mis à jour avec succès',
        data: updatedService[0] // Retour direct sans mapping
      });
      
    } catch (error) {
      console.error('❌ Erreur update service:', error);
      res.status(500).json({
        error: 'Erreur lors de la mise à jour du service',
        details: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // Mettre à jour le statut d'un service
  static async updateStatus(req, res) {
    const { id } = req.params;
    const { active } = req.body; // Utilise directement 'active' comme en DB
    let connection;
    
    try {
      connection = await this.getConnection();
      
      const [result] = await connection.execute(
        'UPDATE services SET active = ? WHERE id = ?',
        [active, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Service non trouvé' });
      }
      
      res.json({
        success: true,
        message: 'Statut du service mis à jour'
      });
      
    } catch (error) {
      console.error('❌ Erreur updateStatus service:', error);
      res.status(500).json({
        error: 'Erreur lors de la mise à jour du statut',
        details: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
  
  // Supprimer un service
  static async delete(req, res) {
    const { id } = req.params;
    let connection;
    
    try {
      connection = await this.getConnection();
      
      const [result] = await connection.execute('DELETE FROM services WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Service non trouvé' });
      }
      
      res.json({
        success: true,
        message: 'Service supprimé avec succès'
      });
      
    } catch (error) {
      console.error('❌ Erreur delete service:', error);
      res.status(500).json({
        error: 'Erreur lors de la suppression du service',
        details: error.message
      });
    } finally {
      if (connection) await connection.end();
    }
  }
}

module.exports = ServiceDirectController;
