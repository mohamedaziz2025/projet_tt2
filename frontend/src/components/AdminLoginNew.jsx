import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './AdminLogin.css';

const AdminLogin = ({ onNavigateToHome }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.data.admin) {
        // Store admin info in localStorage
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        navigate('/admin/dashboard');
      } else {
        setError('Identifiants invalides');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      if (error.response && error.response.status === 401) {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-background">
        <div className="background-pattern"></div>
        <div className="floating-elements">
          <div className="floating-element">📊</div>
          <div className="floating-element">👨‍💼</div>
          <div className="floating-element">🔐</div>
          <div className="floating-element">📈</div>
        </div>
      </div>

      <div className="admin-login-content">
        <div className="login-header">
          <button className="back-to-home" onClick={onNavigateToHome}>
            ← Retour à l'accueil
          </button>
          
          <div className="login-title-section">
            <div className="admin-icon">
              <span className="icon-badge">👨‍💼</span>
            </div>
            <h1 className="login-title">Espace Administrateur</h1>
            <p className="login-subtitle">
              Accédez au tableau de bord pour gérer les files d'attente
            </p>
          </div>
        </div>

        <div className="login-form-wrapper">
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-header">
              <h2>Se connecter</h2>
              <p>Saisissez vos identifiants administrateur</p>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">👤</span>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Entrez votre email"
                className={error ? 'error' : ''}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Mot de passe
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Entrez votre mot de passe"
                  className={error ? 'error' : ''}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Se connecter
                </>
              )}
            </button>

            <div className="login-footer">
              <div className="security-info">
                <span className="security-icon">🔐</span>
                <span>Connexion sécurisée</span>
              </div>
            </div>
          </form>

          <div className="login-features">
            <h3>Fonctionnalités administrateur</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <div className="feature-text">
                  <strong>Tableau de bord</strong>
                  <span>Vue d'ensemble des activités</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎫</span>
                <div className="feature-text">
                  <strong>Gestion des tickets</strong>
                  <span>Suivi et traitement</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <div className="feature-text">
                  <strong>Statistiques</strong>
                  <span>Rapports détaillés</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚙️</span>
                <div className="feature-text">
                  <strong>Paramètres</strong>
                  <span>Configuration système</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
