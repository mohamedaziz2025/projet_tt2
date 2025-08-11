const ticketService = require('../services/ticketService');

exports.create = async (req, res) => {
  try {
    console.log('📝 Création ticket - Données reçues:', req.body);
    
    const { agence, service, email } = req.body;
    
    // Validation des champs
    if (!agence || !service || !email) {
      console.log('❌ Champs requis manquants');
      return res.status(400).json({ error: 'Tous les champs (agence, service, email) sont requis.' });
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email invalide');
      return res.status(400).json({ error: 'Format d\'email invalide.' });
    }
    
    console.log('✅ Validation réussie, création du ticket...');
    
    // Vérifier que ticketService est bien chargé
    if (!ticketService || typeof ticketService.createTicket !== 'function') {
      console.error('❌ ticketService non disponible');
      return res.status(500).json({ error: 'Service de tickets non disponible.' });
    }
    
    const ticket = await ticketService.createTicket({ 
      agence, 
      service, 
      email, 
      status: 'en_attente' 
    });
    
    console.log('✅ Ticket créé:', ticket.id);
    
    res.status(201).json({
      success: true,
      numero: `A-${ticket.id.toString().padStart(3, '0')}`,
      estimation: ticket.estimation_minutes,
      message: 'Ticket créé avec succès'
    });
    
  } catch (err) {
    console.error('❌ Erreur création ticket:', err);
    console.error('Stack trace:', err.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la création du ticket',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
