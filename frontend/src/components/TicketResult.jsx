import React from 'react';

const TicketResult = ({ ticket, onNewTicket }) => {
  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="card">
      <div className="ticket-result">
        <div className="alert alert-success">
          ✅ Votre ticket a été créé avec succès !
        </div>

        <div className="ticket-number">
          {ticket.numero}
        </div>

        <div className="ticket-info">
          <h3>Informations de votre ticket</h3>
          
          <div className="ticket-detail">
            <span><strong>Temps d'attente estimé :</strong></span>
            <span>{ticket.estimation} minutes</span>
          </div>

          <div className="ticket-detail">
            <span><strong>Heure de réservation :</strong></span>
            <span>{currentTime}</span>
          </div>

          <div className="ticket-detail">
            <span><strong>Position approximative :</strong></span>
            <span>{Math.ceil(ticket.estimation / 5)} personnes devant vous</span>
          </div>
        </div>

        <div style={{ 
          background: 'var(--tt-gray)', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          color: 'var(--tt-text-light)'
        }}>
          <p><strong>📧 Email de confirmation envoyé !</strong></p>
          <p>Vous recevrez une notification quand votre tour approche.</p>
          <p>Merci de vous présenter à l'agence 5 minutes avant l'heure estimée.</p>
        </div>

        <button
          onClick={onNewTicket}
          className="btn btn-primary"
        >
          Réserver un nouveau ticket
        </button>
      </div>
    </div>
  );
};

export default TicketResult;
