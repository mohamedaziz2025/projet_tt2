const mysql = require('mysql2/promise');

// Version ultra-simple pour résoudre les erreurs 500 - MySQL2 direct
exports.simpleUpdateTicket = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log('🎯 Simple update MySQL2 - Ticket:', id, 'Status:', status);
  
  let connection;
  try {
    // 1. Connexion MySQL directe
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
    console.log('✅ Connexion MySQL établie');
    
    // 2. Supprimer le trigger problématique
    await connection.execute('DROP TRIGGER IF EXISTS update_queue_position');
    console.log('✅ Trigger supprimé');
    
    // 3. Mise à jour directe
    const [updateResult] = await connection.execute(
      'UPDATE tickets SET status = ? WHERE id = ?', 
      [status, id]
    );
    console.log('✅ Ticket mis à jour, affected rows:', updateResult.affectedRows);
    
    // 4. Vérifier le résultat
    const [result] = await connection.execute(
      'SELECT id, status, agence, service FROM tickets WHERE id = ?', 
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'Ticket non trouvé',
        ticketId: id
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Mise à jour réussie avec MySQL2',
      data: {
        affectedRows: updateResult.affectedRows,
        ticket: result[0]
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur simple update MySQL2:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Connexion MySQL fermée');
    }
  }
};
