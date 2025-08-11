// Version temporaire sans base de données pour tester
const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function estimateWaitTime() {
  const currentHour = new Date().getHours();
  const peakHours = [9, 10, 11, 14, 15, 16];
  
  let baseTime = 8;
  if (peakHours.includes(currentHour)) {
    baseTime = 12;
  }
  
  return baseTime;
}

async function createTicket(data) {
  try {
    console.log('🎫 Création d\'un nouveau ticket avec les données:', data);
    
    const estimation = estimateWaitTime();
    const heure_arrivee = new Date();
    
    console.log('⏰ Estimation calculée:', estimation, 'minutes');
    console.log('🕐 Heure d\'arrivée:', heure_arrivee);
    
    const ticketData = {
      ...data,
      heure_arrivee,
      estimation_minutes: estimation
    };
    
    console.log('📝 Données du ticket à créer:', ticketData);
    
    // Simulation de création de ticket sans base de données
    const fakeTicket = {
      id: Math.floor(Math.random() * 1000) + 1,
      ...ticketData
    };
    
    console.log('✅ Ticket simulé créé avec succès:', fakeTicket.id);
    
    // Envoyer l'email de confirmation (sans bloquer si ça échoue)
    try {
      await sendConfirmationEmail(fakeTicket);
    } catch (emailError) {
      console.error('❌ Erreur envoi email (ticket créé quand même):', emailError.message);
    }
    
    return fakeTicket;
  } catch (error) {
    console.error('❌ Erreur lors de la création du ticket:', error);
    throw error;
  }
}

async function sendConfirmationEmail(ticket) {
  console.log('📧 Simulation envoi email pour ticket:', ticket.id);
  return true;
}

async function sendApproachNotification(ticket) {
  console.log('🔔 Simulation notification pour ticket:', ticket.id);
  return true;
}

module.exports = { 
  createTicket,
  sendConfirmationEmail,
  sendApproachNotification
};
