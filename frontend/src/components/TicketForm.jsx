import React, { useState } from 'react';
import axios from 'axios';

const TicketForm = ({ onTicketCreated }) => {
  const [formData, setFormData] = useState({
    agence: '',
    service: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const agences = [
    'Agence Centre-Ville Tunis',
    'Agence Manouba',
    'Agence Ariana',
    'Agence Sfax Centre',
    'Agence Sousse',
    'Agence Bizerte',
    'Agence Nabeul',
    'Agence Kairouan'
  ];

  const services = [
    'Facturation et paiement',
    'Support technique',
    'Nouveau abonnement',
    'Résiliation',
    'Réclamation',
    'Information forfaits',
    'Services entreprise',
    'Autres'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/tickets', formData);
      onTicketCreated(response.data);
    } catch (err) {
      setError('Erreur lors de la création du ticket. Veuillez réessayer.');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Réservation de ticket</h2>
        <p className="card-subtitle">
          Choisissez votre agence et service pour obtenir votre ticket de file d'attente
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="agence" className="form-label">
            Sélectionnez votre agence *
          </label>
          <select
            id="agence"
            name="agence"
            value={formData.agence}
            onChange={handleInputChange}
            className="form-control form-select"
            required
          >
            <option value="">-- Choisir une agence --</option>
            {agences.map((agence, index) => (
              <option key={index} value={agence}>
                {agence}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="service" className="form-label">
            Type de service *
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleInputChange}
            className="form-control form-select"
            required
          >
            <option value="">-- Choisir un service --</option>
            {services.map((service, index) => (
              <option key={index} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Votre email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-control"
            placeholder="exemple@email.com"
            required
          />
          <small style={{ color: 'var(--tt-text-light)', fontSize: '0.85rem' }}>
            Vous recevrez une confirmation et des notifications par email
          </small>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              Création en cours...
            </>
          ) : (
            'Obtenir mon ticket'
          )}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
