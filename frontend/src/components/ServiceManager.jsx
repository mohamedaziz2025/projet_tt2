import React, { useState, useEffect } from 'react';
import { serviceService } from '../services/api';
import './ServiceManager.css';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    duree_moyenne: 15,
    active: 1
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAll();
      setServices(response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des services');
      console.error('Erreur services:', err);
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
      
      if (editingService) {
        await serviceService.update(editingService.id, formData);
      } else {
        await serviceService.create(formData);
      }
      
      setShowModal(false);
      setEditingService(null);
      resetForm();
      loadServices();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error('Erreur sauvegarde:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      nom: service.nom,
      description: service.description,
      duree_moyenne: service.duree_moyenne,
      active: service.active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await serviceService.delete(id);
        loadServices();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleStatusChange = async (id, newActive) => {
    try {
      await serviceService.updateStatus(id, { active: newActive });
      loadServices();
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      duree_moyenne: 15,
      active: 1
    });
  };

  const openAddModal = () => {
    setEditingService(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="service-manager">
      <div className="service-header">
        <h2>
          <span className="header-icon">🛎️</span>
          Gestion des Services
        </h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <span>➕</span>
          Nouveau Service
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

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className={`service-card ${service.active ? 'active' : 'disabled'}`}>
            <div className="service-card-header">
              <div className="service-title">
                <span className="service-icon">
                  🛎️
                </span>
                <h3>{service.nom}</h3>
              </div>
              <div className="status-badge">
                <select
                  value={service.active}
                  onChange={(e) => handleStatusChange(service.id, parseInt(e.target.value))}
                  className={`status-select ${service.active ? 'active' : 'disabled'}`}
                >
                  <option value={1}>🟢 Actif</option>
                  <option value={0}>🔴 Désactivé</option>
                </select>
              </div>
            </div>

            <div className="service-info">
              <div className="service-description">
                {service.description}
              </div>

              <div className="service-details">
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <span>Durée: {service.duree_moyenne} min</span>
                </div>
              </div>
            </div>

            <div className="service-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => handleEdit(service)}
              >
                ✏️ Modifier
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(service.id)}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour ajouter/modifier un service */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editingService ? '✏️ Modifier le service' : '➕ Nouveau service'}
              </h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nom du service *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Services Mobile"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Description détaillée du service"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Durée moyenne (minutes) *</label>
                  <input
                    type="number"
                    name="duree_moyenne"
                    value={formData.duree_moyenne}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="120"
                  />
                </div>

                <div className="form-group">
                  <label>Statut *</label>
                  <select
                    name="active"
                    value={formData.active}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={1}>🟢 Actif</option>
                    <option value={0}>🔴 Désactivé</option>
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
                  {loading ? 'Sauvegarde...' : (editingService ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;
