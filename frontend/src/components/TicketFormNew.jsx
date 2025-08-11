import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/api';
import './TicketForm.css';

const TicketForm = ({ onNavigateToHome }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    service: '',
    agence: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const services = [
    { id: 'mobile', name: '📱 Services Mobile', description: 'Abonnements, recharges, problèmes réseau' },
    { id: 'internet', name: '🌐 Internet & ADSL', description: 'Installation, problèmes de connexion' },
    { id: 'fixe', name: '☎️ Téléphonie Fixe', description: 'Ligne fixe, factures, dérangements' },
    { id: 'entreprise', name: '💼 Solutions Entreprise', description: 'Services professionnels, contrats' },
    { id: 'facturation', name: '💳 Facturation', description: 'Paiements, réclamations, remboursements' },
    { id: 'technique', name: '🔧 Support Technique', description: 'Assistance technique, configuration' }
  ];

  const agences = [
    { id: 'tunis-centre', name: '🏢 Tunis Centre', address: 'Avenue Habib Bourguiba', waitTime: '15-20 min' },
    { id: 'sfax', name: '🏢 Sfax', address: 'Avenue Hedi Chaker', waitTime: '10-15 min' },
    { id: 'sousse', name: '🏢 Sousse', address: 'Boulevard 14 Janvier', waitTime: '20-25 min' },
    { id: 'bizerte', name: '🏢 Bizerte', address: 'Avenue de la République', waitTime: '5-10 min' },
    { id: 'gabes', name: '🏢 Gabès', address: 'Rue de la Liberté', waitTime: '15-20 min' },
    { id: 'kairouan', name: '🏢 Kairouan', address: 'Avenue de la République', waitTime: '10-15 min' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^\d{8}$/.test(formData.telephone.trim())) {
      newErrors.telephone = 'Format: 8 chiffres (ex: 20123456)';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email invalide';
    }
    if (!formData.service) newErrors.service = 'Veuillez sélectionner un service';
    if (!formData.agence) newErrors.agence = 'Veuillez sélectionner une agence';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await createTicket(formData);
      
      setSubmitStatus({
        type: 'success',
        message: `Votre ticket a été créé avec succès! Numéro: ${response.data.ticketNumber}`,
        ticketData: response.data
      });
      
      // Reset form
      setFormData({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        service: '',
        agence: ''
      });
      
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Erreur lors de la création du ticket. Veuillez réessayer.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedService = () => {
    return services.find(s => s.id === formData.service);
  };

  const getSelectedAgence = () => {
    return agences.find(a => a.id === formData.agence);
  };

  return (
    <div className="ticket-form-container">
      <div className="ticket-form-header">
        <button className="back-to-home" onClick={() => navigate('/')}>
          ← Retour à l'accueil
        </button>
        <h1 className="form-title">
          <span className="title-icon">🎫</span>
          Réserver votre ticket
        </h1>
        <p className="form-subtitle">
          Évitez l'attente en réservant votre place dans la file d'attente
        </p>
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="ticket-form">
          {/* Section Informations personnelles */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">👤</span>
              Informations personnelles
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className={errors.prenom ? 'error' : ''}
                  placeholder="Votre prénom"
                />
                {errors.prenom && <span className="error-text">{errors.prenom}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={errors.nom ? 'error' : ''}
                  placeholder="Votre nom de famille"
                />
                {errors.nom && <span className="error-text">{errors.nom}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telephone">Téléphone *</label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className={errors.telephone ? 'error' : ''}
                  placeholder="20123456"
                  maxLength="8"
                />
                {errors.telephone && <span className="error-text">{errors.telephone}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="votre.email@exemple.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>
          </div>

          {/* Section Service */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🛎️</span>
              Type de service
            </h3>
            
            <div className="service-grid">
              {services.map(service => (
                <label key={service.id} className={`service-card ${formData.service === service.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={formData.service === service.id}
                    onChange={handleInputChange}
                  />
                  <div className="service-content">
                    <div className="service-name">{service.name}</div>
                    <div className="service-description">{service.description}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.service && <span className="error-text">{errors.service}</span>}
          </div>

          {/* Section Agence */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📍</span>
              Choisir l'agence
            </h3>
            
            <div className="agence-grid">
              {agences.map(agence => (
                <label key={agence.id} className={`agence-card ${formData.agence === agence.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="agence"
                    value={agence.id}
                    checked={formData.agence === agence.id}
                    onChange={handleInputChange}
                  />
                  <div className="agence-content">
                    <div className="agence-name">{agence.name}</div>
                    <div className="agence-address">{agence.address}</div>
                    <div className="agence-wait">⏱️ Attente: {agence.waitTime}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.agence && <span className="error-text">{errors.agence}</span>}
          </div>

          {/* Récapitulatif */}
          {(formData.service || formData.agence) && (
            <div className="form-section recap-section">
              <h3 className="section-title">
                <span className="section-icon">📋</span>
                Récapitulatif
              </h3>
              
              <div className="recap-content">
                {getSelectedService() && (
                  <div className="recap-item">
                    <strong>Service:</strong> {getSelectedService().name}
                  </div>
                )}
                {getSelectedAgence() && (
                  <div className="recap-item">
                    <strong>Agence:</strong> {getSelectedAgence().name}
                    <br />
                    <small>📍 {getSelectedAgence().address}</small>
                    <br />
                    <small>⏱️ Temps d'attente estimé: {getSelectedAgence().waitTime}</small>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Création en cours...
                </>
              ) : (
                <>
                  <span>🎫</span>
                  Créer mon ticket
                </>
              )}
            </button>
          </div>

          {/* Status messages */}
          {submitStatus && (
            <div className={`status-message ${submitStatus.type}`}>
              {submitStatus.type === 'success' ? (
                <div className="success-content">
                  <div className="success-icon">✅</div>
                  <div className="success-text">
                    <h4>Ticket créé avec succès!</h4>
                    <p>Numéro de ticket: <strong>{submitStatus.ticketData.ticketNumber}</strong></p>
                    <p>Vous recevrez une notification par email avec les détails.</p>
                  </div>
                </div>
              ) : (
                <div className="error-content">
                  <div className="error-icon">❌</div>
                  <div className="error-text">{submitStatus.message}</div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
