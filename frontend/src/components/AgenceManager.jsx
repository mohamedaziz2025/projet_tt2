import React, { useState, useEffect } from 'react';
import { agenceService } from '../services/api';
import './AgenceManager.css';

const AgenceManager = () => {
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAgence, setEditingAgence] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    horaires_ouverture: '',
    services_disponibles: '',
    temps_moyen_service: 15,
    active: true
  });

  useEffect(() => {
    loadAgences();
  }, []);

  const loadAgences = async () => {
    try {
      setLoading(true);
      const response = await agenceService.getAll();
      setAgences(response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des agences');
      console.error('Erreur agences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Préparer les données avec le bon format pour services_disponibles
      const dataToSend = {
        ...formData,
        // Convertir services_disponibles en JSON si c'est une string
        services_disponibles: typeof formData.services_disponibles === 'string' && formData.services_disponibles.trim() 
          ? JSON.stringify(formData.services_disponibles.split(',').map(s => s.trim()).filter(s => s))
          : formData.services_disponibles
      };
      
      // Nettoyer les champs vides pour éviter les erreurs SQL
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });
      
      console.log('📤 Données envoyées:', dataToSend);
      
      if (editingAgence) {
        await agenceService.update(editingAgence.id, dataToSend);
      } else {
        await agenceService.create(dataToSend);
      }
      
      setShowModal(false);
      setEditingAgence(null);
      resetForm();
      loadAgences();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error('Erreur sauvegarde:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agence) => {
    setEditingAgence(agence);
    
    // Convertir services_disponibles de JSON string vers string simple pour l'édition
    let servicesStr = '';
    if (agence.services_disponibles) {
      try {
        if (typeof agence.services_disponibles === 'string' && agence.services_disponibles.startsWith('[')) {
          const servicesArray = JSON.parse(agence.services_disponibles);
          servicesStr = servicesArray.join(', ');
        } else {
          servicesStr = agence.services_disponibles.toString();
        }
      } catch (e) {
        console.warn('Erreur parsing services:', e);
        servicesStr = agence.services_disponibles.toString();
      }
    }
    
    setFormData({
      nom: agence.nom || '',
      adresse: agence.adresse || '',
      telephone: agence.telephone || '',
      email: agence.email || '',
      horaires_ouverture: agence.horaires_ouverture || '',
      services_disponibles: servicesStr,
      temps_moyen_service: agence.temps_moyen_service || 15,
      active: agence.active !== undefined ? agence.active : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) {
      try {
        await agenceService.delete(id);
        loadAgences();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await agenceService.update(id, { active: newStatus === 'active' });
      loadAgences();
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      horaires_ouverture: '',
      services_disponibles: '',
      temps_moyen_service: 15,
      active: true
    });
  };

  const openAddModal = () => {
    setEditingAgence(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="agence-manager">
      <div className="agence-header">
        <h2>
          <span className="header-icon">🏢</span>
          Gestion des Agences
        </h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <span>➕</span>
          Nouvelle Agence
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Chargement...</span>
        </div>
      )}

      <div className="agences-grid">
        {agences.map((agence) => (
          <div key={agence.id} className={`agence-card ${agence.active ? 'active' : 'inactive'}`}>
            <div className="agence-card-header">
              <h3>{agence.nom}</h3>
              <div className="status-badge">
                <select
                  value={agence.active ? 'active' : 'inactive'}
                  onChange={(e) => handleStatusChange(agence.id, e.target.value)}
                  className={`status-select ${agence.active ? 'active' : 'inactive'}`}
                >
                  <option value="active">🟢 Active</option>
                  <option value="inactive">� Inactive</option>
                </select>
              </div>
            </div>

            <div className="agence-info">
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <strong>Adresse:</strong>
                  <br />
                  {agence.adresse || 'Non renseignée'}
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">📞</span>
                <div>
                  <strong>Téléphone:</strong>
                  <br />
                  {agence.telephone || 'Non renseigné'}
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">✉️</span>
                <div>
                  <strong>Email:</strong>
                  <br />
                  {agence.email || 'Non renseigné'}
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">🕒</span>
                <div>
                  <strong>Horaires:</strong>
                  <br />
                  {agence.horaires_ouverture || 'Non renseignés'}
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">⏱️</span>
                <div>
                  <strong>Temps moyen:</strong>
                  <br />
                  {agence.temps_moyen_service || 15} minutes
                </div>
              </div>
            </div>

            <div className="agence-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => handleEdit(agence)}
              >
                ✏️ Modifier
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(agence.id)}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour ajouter/modifier une agence */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editingAgence ? '✏️ Modifier l\'agence' : '➕ Nouvelle agence'}
              </h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom de l'agence *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Agence Tunis Centre"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse complète</label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Ex: Avenue Habib Bourguiba, 1000 Tunis"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="Ex: 71 123 456"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ex: tunis@tunisietelecom.tn"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Horaires d'ouverture</label>
                <textarea
                  name="horaires_ouverture"
                  value={formData.horaires_ouverture}
                  onChange={handleInputChange}
                  placeholder="Ex: Lundi-Vendredi: 8h00-17h00, Samedi: 8h00-12h00"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Services disponibles</label>
                <textarea
                  name="services_disponibles"
                  value={formData.services_disponibles}
                  onChange={handleInputChange}
                  placeholder="Ex: Abonnements, Facturation, Support technique..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Temps moyen de service (minutes)</label>
                  <input
                    type="number"
                    name="temps_moyen_service"
                    value={formData.temps_moyen_service}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    placeholder="15"
                  />
                </div>

                <div className="form-group">
                  <label>Statut</label>
                  <select
                    name="active"
                    value={formData.active}
                    onChange={handleInputChange}
                  >
                    <option value={true}>🟢 Active</option>
                    <option value={false}>� Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Sauvegarde...' : (editingAgence ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenceManager;
