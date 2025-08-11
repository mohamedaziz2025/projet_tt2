console.log('🚀 Test ticketService - début');

const Ticket = require('../models/Ticket');
console.log('✅ Ticket importé');

const nodemailer = require('nodemailer');
console.log('✅ nodemailer importé');

// Configuration simple du transporteur
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'testpass'
  }
});
console.log('✅ Transporter configuré');

function estimateWaitTime() {
  console.log('⏰ estimateWaitTime appelée');
  return 8;
}

async function createTicket(data) {
  console.log('🎫 createTicket appelée avec:', data);
  try {
    const estimation = estimateWaitTime();
    const heure_arrivee = new Date();
    
    const ticket = await Ticket.create({
      ...data,
      heure_arrivee,
      estimation_minutes: estimation
    });
    
    console.log('✅ Ticket créé:', ticket.id);
    return ticket;
  } catch (error) {
    console.error('❌ Erreur création ticket:', error);
    throw error;
  }
}

async function sendConfirmationEmail(ticket) {
  console.log('📧 sendConfirmationEmail appelée');
  return true;
}

async function sendApproachNotification(ticket) {
  console.log('🔔 sendApproachNotification appelée');
  return true;
}

console.log('📦 Avant export');

module.exports = { 
  createTicket,
  sendConfirmationEmail,
  sendApproachNotification
};

console.log('✅ ticketService exporté');
