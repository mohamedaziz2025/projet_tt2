const nodemailer = require('nodemailer');

console.log('🚀 Chargement ticketService...');

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

console.log('📧 Transporter configuré');

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
  console.log('🎫 createTicket appelée avec:', data);
  
  try {
    // Import dynamique du modèle
    const Ticket = require('../models/Ticket');
    console.log('✅ Modèle Ticket importé');
    
    const estimation = estimateWaitTime();
    const heure_arrivee = new Date();
    
    const ticketData = {
      agence: data.agence,
      service: data.service,
      email: data.email,
      status: data.status || 'en_attente',
      heure_arrivee,
      estimation_minutes: estimation
    };
    
    console.log('📝 Création avec données:', ticketData);
    
    const ticket = await Ticket.create(ticketData);
    console.log('✅ Ticket créé:', ticket.toJSON());
    
    // Email en arrière-plan (ne pas bloquer)
    setImmediate(async () => {
      try {
        await sendConfirmationEmail(ticket);
      } catch (emailError) {
        console.error('❌ Erreur email:', emailError.message);
      }
    });
    
    return ticket;
  } catch (error) {
    console.error('❌ Erreur createTicket:', error);
    throw error;
  }
}

async function sendConfirmationEmail(ticket) {
  console.log('📧 Envoi email pour ticket:', ticket.id);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Pas de config email, skip');
    return;
  }
  
  const ticketNumber = `A-${ticket.id.toString().padStart(3, '0')}`;
  const estimatedTime = new Date(ticket.heure_arrivee.getTime() + ticket.estimation_minutes * 60000);
  
  const htmlContent = `
    <h1>🔴 Tunisie Telecom</h1>
    <h2>Confirmation de votre ticket ${ticketNumber}</h2>
    <p><strong>Agence:</strong> ${ticket.agence}</p>
    <p><strong>Service:</strong> ${ticket.service}</p>
    <p><strong>Temps d'attente estimé:</strong> ${ticket.estimation_minutes} minutes</p>
    <p><strong>Heure estimée:</strong> ${estimatedTime.toLocaleTimeString('fr-FR')}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Tunisie Telecom" <${process.env.EMAIL_FROM}>`,
      to: ticket.email,
      subject: `Confirmation ticket ${ticketNumber} - Tunisie Telecom`,
      html: htmlContent
    });
    console.log(`✅ Email envoyé à ${ticket.email}`);
  } catch (error) {
    console.error('❌ Erreur envoi email:', error.message);
  }
}

async function sendApproachNotification(ticket) {
  console.log('🔔 Notification pour ticket:', ticket.id);
  return true;
}

console.log('📦 Export des fonctions...');

const exports_obj = {
  createTicket,
  sendConfirmationEmail,
  sendApproachNotification
};

console.log('📦 Fonctions à exporter:', Object.keys(exports_obj));

module.exports = exports_obj;

console.log('✅ ticketService chargé avec succès');
