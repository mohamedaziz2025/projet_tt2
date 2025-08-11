const mysql = require('mysql2/promise');

// Test de connexion MySQL direct super simple
exports.testMySQLConnection = async (req, res) => {
  try {
    console.log('🔗 Test connexion MySQL directe...');
    
    // Connexion simple
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
    
    console.log('✅ Connexion MySQL établie');
    
    // Test simple : récupérer un ticket
    const [rows] = await connection.execute('SELECT id, status FROM tickets WHERE id = 14');
    
    console.log('✅ Requête SELECT réussie:', rows);
    
    await connection.end();
    console.log('✅ Connexion fermée');
    
    res.json({
      success: true,
      message: 'Connexion MySQL OK',
      data: rows[0] || null
    });
    
  } catch (error) {
    console.error('❌ Erreur MySQL:', error);
    res.status(500).json({
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      stack: error.stack
    });
  }
};

// Test de mise à jour super simple
exports.testSimpleUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('⚡ Test mise à jour simple - ID:', id, 'Status:', status);
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'queue_management'
    });
    
    // Supprimer le trigger
    await connection.execute('DROP TRIGGER IF EXISTS update_queue_position');
    console.log('✅ Trigger supprimé');
    
    // Mise à jour
    const [result] = await connection.execute(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, id]
    );
    
    console.log('✅ Update réussi, affected rows:', result.affectedRows);
    
    // Vérifier le résultat
    const [updated] = await connection.execute(
      'SELECT id, status FROM tickets WHERE id = ?',
      [id]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Mise à jour réussie',
      affectedRows: result.affectedRows,
      ticket: updated[0]
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour:', error);
    res.status(500).json({
      error: error.message,
      code: error.code,
      errno: error.errno
    });
  }
};
