import React, { useState } from 'react';
import { authService } from '../services/api';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: 'admin@tunisietelecom.tn',
    password: 'admin123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      await authService.login(formData.email, formData.password);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--tt-gray)'
    }}>
      <div className="card" style={{ width: '400px', margin: 0 }}>
        <div className="card-header" style={{ textAlign: 'center' }}>
          <h2 className="card-title">🔐 Admin Dashboard</h2>
          <p className="card-subtitle">Connexion administrateur</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-control"
              required
            />
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
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: 'var(--tt-gray)', 
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: 'var(--tt-text-light)'
        }}>
          <p><strong>Accès de test :</strong></p>
          <p>Email : admin@tunisietelecom.tn</p>
          <p>Mot de passe : admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
