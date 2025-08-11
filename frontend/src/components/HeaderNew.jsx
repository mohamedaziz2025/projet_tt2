import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ onNavigateToHome, showBackButton = false }) => {
  return (
    <header className="modern-header">
      <div className="header-container">
        <div className="header-left">
          {showBackButton ? (
            <button className="back-button" onClick={onNavigateToHome}>
              ← Retour accueil
            </button>
          ) : (
            <Link to="/" className="logo-link">
              <span className="logo-icon">🔴</span>
              <span className="logo-text">Tunisie Telecom</span>
            </Link>
          )}
        </div>

        <div className="header-center">
          <span className="header-subtitle">
            Système de gestion de file d'attente
          </span>
        </div>

        <div className="header-right">
          <nav className="header-nav">
            <Link to="/" className="nav-link">
              🏠 Accueil
            </Link>
            <Link to="/ticket" className="nav-link">
              📱 Réserver
            </Link>
            <Link to="/admin/login" className="nav-link admin-link">
              👨‍💼 Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
