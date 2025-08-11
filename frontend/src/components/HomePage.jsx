import React from 'react';
import './HomePage.css';

const HomePage = ({ onNavigateToTicket, onNavigateToAdmin }) => {
  const services = [
    {
      id: 'factures',
      title: 'Factures & Paiements',
      icon: '💳',
      description: 'Consultation et paiement de vos factures',
      features: ['Consulter factures', 'Historique paiements', 'Échéancier']
    },
    {
      id: 'abonnements',
      title: 'Abonnements',
      icon: '📱',
      description: 'Gestion de vos abonnements et services',
      features: ['Nouveaux abonnements', 'Modifications', 'Résiliations']
    },
    {
      id: 'reclamations',
      title: 'Réclamations',
      icon: '📞',
      description: 'Support technique et réclamations',
      features: ['Problèmes techniques', 'Réclamations', 'Suivi dossiers']
    },
    {
      id: 'adsl',
      title: 'Internet ADSL',
      icon: '🌐',
      description: 'Services Internet et Wi-Fi',
      features: ['Installation ADSL', 'Problèmes connexion', 'Upgrade débit']
    },
    {
      id: 'mobile',
      title: 'Services Mobile',
      icon: '📲',
      description: 'Cartes SIM et services mobiles',
      features: ['Nouvelle SIM', 'Transfert numéro', 'Forfaits']
    },
    {
      id: 'entreprise',
      title: 'Solutions Entreprise',
      icon: '🏢',
      description: 'Services dédiés aux entreprises',
      features: ['Lignes spécialisées', 'Réseaux privés', 'Solutions VoIP']
    }
  ];

  const agences = [
    { nom: 'Tunis Centre', adresse: 'Avenue Habib Bourguiba, Tunis', horaires: '08h00 - 17h00' },
    { nom: 'Ariana', adresse: 'Centre Ville Ariana', horaires: '08h00 - 17h00' },
    { nom: 'Sfax', adresse: 'Avenue Hedi Chaker, Sfax', horaires: '08h00 - 17h00' },
    { nom: 'Sousse', adresse: 'Rue de la République, Sousse', horaires: '08h00 - 17h00' },
    { nom: 'Gabès', adresse: 'Centre Ville Gabès', horaires: '08h00 - 17h00' },
    { nom: 'Bizerte', adresse: 'Avenue de l\'Indépendance, Bizerte', horaires: '08h00 - 17h00' }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              <span className="logo">🔴</span>
              Bienvenue chez Tunisie Telecom
            </h1>
            <p className="hero-subtitle">
              Système de gestion de file d'attente intelligent
            </p>
            <p className="hero-description">
              Réservez votre créneau, évitez l'attente et gérez vos démarches en toute simplicité
            </p>
            <div className="hero-actions">
              <button 
                className="cta-button primary"
                onClick={() => onNavigateToTicket()}
              >
                📱 Réserver mon créneau
              </button>
              <button 
                className="cta-button secondary"
                onClick={() => onNavigateToAdmin()}
              >
                👨‍💼 Espace Admin
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="queue-visualization">
              <div className="queue-item active">👤</div>
              <div className="queue-item">👤</div>
              <div className="queue-item">👤</div>
              <div className="queue-arrow">→</div>
              <div className="service-desk">🏢</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="container">
          <h2>🎯 Nos Services</h2>
          <p className="section-subtitle">Choisissez le service qui correspond à vos besoins</p>
          
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
                <button 
                  className="service-button"
                  onClick={() => onNavigateToTicket(service.id)}
                >
                  Réserver maintenant
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <h2>💡 Comment ça marche ?</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>📋 Choisissez votre service</h3>
                <p>Sélectionnez le service et l'agence qui vous conviennent</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>⏰ Recevez votre estimation</h3>
                <p>Obtenez votre numéro de ticket et le temps d'attente estimé</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>📧 Restez informé</h3>
                <p>Recevez une notification quand votre tour approche</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>🏢 Présentez-vous à l'agence</h3>
                <p>Arrivez à l'heure prévue, votre guichet vous attend</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agences */}
      <section className="agences">
        <div className="container">
          <h2>🏢 Nos Agences</h2>
          <div className="agences-grid">
            {agences.map((agence, index) => (
              <div key={index} className="agence-card">
                <h3>{agence.nom}</h3>
                <p className="agence-address">📍 {agence.adresse}</p>
                <p className="agence-hours">🕒 {agence.horaires}</p>
                <button 
                  className="agence-button"
                  onClick={() => onNavigateToTicket(null, agence.nom)}
                >
                  Choisir cette agence
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact et informations */}
      <section className="contact-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>📞 Nous contacter</h3>
              <p><strong>Numéro d'appel :</strong> 1298</p>
              <p><strong>Email :</strong> contact@tunisietelecom.tn</p>
              <p><strong>Site web :</strong> www.tunisietelecom.tn</p>
            </div>
            <div className="info-card">
              <h3>⏰ Horaires d'ouverture</h3>
              <p><strong>Lundi - Vendredi :</strong> 08h00 - 17h00</p>
              <p><strong>Samedi :</strong> 08h00 - 12h00</p>
              <p><strong>Dimanche :</strong> Fermé</p>
            </div>
            <div className="info-card">
              <h3>💡 Avantages</h3>
              <p>✓ Pas d'attente physique</p>
              <p>✓ Notifications en temps réel</p>
              <p>✓ Service personnalisé</p>
              <p>✓ Gain de temps garanti</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
