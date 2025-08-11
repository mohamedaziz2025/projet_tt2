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
  console.log('🔔 Envoi notification d\'approche pour ticket:', ticket.id);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Pas de config email, skip notification');
    return false;
  }
  
  const ticketNumber = `A-${ticket.id.toString().padStart(3, '0')}`;
  const now = new Date();
  const estimatedTime = new Date(ticket.heure_arrivee.getTime() + ticket.estimation_minutes * 60000);
  const waitingTime = Math.round((now - new Date(ticket.heure_arrivee)) / (1000 * 60));
  
  // Template d'email pour notification d'approche
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
      <div style="text-align: center; background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%); color: white; padding: 25px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🔔 Tunisie Telecom</h1>
        <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: normal;">Votre tour approche !</h2>
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #dee2e6;">
        <h3 style="color: #00BCD4; margin-bottom: 20px;">📋 Détails de votre ticket</h3>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>🎫 Numéro:</strong> ${ticketNumber}</p>
          <p style="margin: 5px 0;"><strong>🏢 Agence:</strong> ${ticket.agence}</p>
          <p style="margin: 5px 0;"><strong>🛎️ Service:</strong> ${ticket.service}</p>
          <p style="margin: 5px 0;"><strong>⏱️ Temps d'attente:</strong> ${waitingTime} minutes</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f7f7, #f0fffe); padding: 20px; border-radius: 8px; border-left: 4px solid #00BCD4; margin-bottom: 20px;">
          <h4 style="color: #00BCD4; margin-top: 0;">⚠️ Important</h4>
          <p style="margin: 10px 0;">Votre tour approche ! Veuillez vous présenter à l'agence dans les prochaines minutes.</p>
          <p style="margin: 10px 0; color: #666;"><strong>Heure estimée:</strong> ${estimatedTime.toLocaleTimeString('fr-FR')}</p>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
          <p style="color: #666; font-size: 14px;">Merci de votre patience et à bientôt dans nos agences !</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 15px; color: #666; font-size: 12px;">
        <p>© 2025 Tunisie Telecom - Service de gestion de file d'attente</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Tunisie Telecom - File d'attente" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: ticket.email,
      subject: `🔔 Votre tour approche - Ticket ${ticketNumber} - Tunisie Telecom`,
      html: htmlContent
    });
    console.log(`✅ Notification d'approche envoyée à ${ticket.email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi notification:', error.message);
    return false;
  }
}

// Nouvelle fonction pour notification manuelle depuis le dashboard
async function sendManualNotification(ticket, message = null) {
  console.log('📤 Envoi notification manuelle pour ticket:', ticket.id);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Pas de config email, skip notification manuelle');
    return false;
  }
  
  const ticketNumber = `A-${ticket.id.toString().padStart(3, '0')}`;
  const now = new Date();
  const waitingTime = Math.round((now - new Date(ticket.heure_arrivee)) / (1000 * 60));
  
  const defaultMessage = "L'administrateur souhaite vous informer concernant votre ticket.";
  const notificationMessage = message || defaultMessage;
  
  // Template pour notification manuelle
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
      <div style="text-align: center; background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%); color: white; padding: 25px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">📧 Tunisie Telecom</h1>
        <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: normal;">Notification concernant votre ticket</h2>
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #dee2e6;">
        <h3 style="color: #00BCD4; margin-bottom: 20px;">📋 Ticket ${ticketNumber}</h3>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>🏢 Agence:</strong> ${ticket.agence}</p>
          <p style="margin: 5px 0;"><strong>🛎️ Service:</strong> ${ticket.service}</p>
          <p style="margin: 5px 0;"><strong>📊 Statut:</strong> ${ticket.status === 'en_attente' ? 'En attente' : ticket.status === 'en_cours' ? 'En cours' : 'Terminé'}</p>
          <p style="margin: 5px 0;"><strong>⏱️ Temps d'attente:</strong> ${waitingTime} minutes</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fff7e6, #fffbf0); padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800; margin-bottom: 20px;">
          <h4 style="color: #e65100; margin-top: 0;">📢 Message</h4>
          <p style="margin: 10px 0; line-height: 1.5;">${notificationMessage}</p>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
          <p style="color: #666; font-size: 14px;">Pour toute question, n'hésitez pas à contacter notre agence.</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 15px; color: #666; font-size: 12px;">
        <p>© 2025 Tunisie Telecom - Service de gestion de file d'attente</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Tunisie Telecom - Administration" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: ticket.email,
      subject: `📧 Notification - Ticket ${ticketNumber} - Tunisie Telecom`,
      html: htmlContent
    });
    console.log(`✅ Notification manuelle envoyée à ${ticket.email}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi notification manuelle:', error.message);
    return false;
  }
}

console.log('📦 Export des fonctions...');

const exports_obj = {
  createTicket,
  sendConfirmationEmail,
  sendApproachNotification,
  sendManualNotification
};

console.log('📦 Fonctions à exporter:', Object.keys(exports_obj));

module.exports = exports_obj;

console.log('✅ ticketService chargé avec succès');
