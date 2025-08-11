const { sequelize } = require('../models');

// Test simple de mise à jour de ticket
exports.testUpdateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('📝 Test update ticket:', id, 'status:', status);
    
    // Test 1: Récupérer le ticket
    const [tickets] = await sequelize.query(
      'SELECT * FROM tickets WHERE id = ?',
      { replacements: [id] }
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }
    
    const ticket = tickets[0];
    console.log('✅ Ticket trouvé:', ticket.id, 'status actuel:', ticket.status);
    
    // Test 2: Supprimer le trigger
    try {
      await sequelize.query('DROP TRIGGER IF EXISTS update_queue_position');
      console.log('✅ Trigger supprimé');
    } catch (dropError) {
      console.log('⚠️ Erreur suppression trigger (peut-être déjà supprimé):', dropError.message);
    }
    
    // Test 3: Mise à jour simple
    const [result] = await sequelize.query(
      'UPDATE tickets SET status = ? WHERE id = ?',
      { replacements: [status, id] }
    );
    
    console.log('✅ Mise à jour réussie, affected rows:', result.affectedRows);
    
    // Test 4: Récupérer le ticket mis à jour
    const [updatedTickets] = await sequelize.query(
      'SELECT * FROM tickets WHERE id = ?',
      { replacements: [id] }
    );
    
    const updatedTicket = updatedTickets[0];
    console.log('✅ Ticket après update:', updatedTicket.status);
    
    res.json({
      success: true,
      message: 'Test réussi',
      before: ticket.status,
      after: updatedTicket.status,
      affectedRows: result.affectedRows
    });
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
    res.status(500).json({
      error: 'Erreur test',
      message: error.message,
      stack: error.stack
    });
  }
};
