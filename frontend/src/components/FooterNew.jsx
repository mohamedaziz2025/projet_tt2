import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-section">
            <h4 className="footer-title">
              <span className="footer-icon">🔴</span>
              Tunisie Telecom
            </h4>
            <p className="footer-description">
              Système moderne de gestion de file d'attente pour une meilleure 
              expérience client dans nos agences.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Services</h4>
            <ul className="footer-links">
              <li><a href="#services">📱 Mobile & Internet</a></li>
              <li><a href="#services">🏠 Fixe & ADSL</a></li>
              <li><a href="#services">💼 Entreprises</a></li>
              <li><a href="#services">🎯 Solutions digitales</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="#help">❓ Centre d'aide</a></li>
              <li><a href="#contact">📞 Contactez-nous</a></li>
              <li><a href="#agencies">🏢 Nos agences</a></li>
              <li><a href="#status">📊 État des services</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Contact</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>1298 (Gratuit 24h/24)</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>contact@tunisietelecom.tn</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Tunis, Tunisie</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; 2024 Tunisie Telecom. Tous droits réservés.</p>
          </div>
          <div className="footer-bottom-center">
            <div className="footer-social">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">💼</a>
            </div>
          </div>
          <div className="footer-bottom-right">
            <div className="footer-legal">
              <a href="#privacy">Confidentialité</a>
              <a href="#terms">Conditions</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 Q300,0 600,60 T1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
        </svg>
      </div>
    </footer>
  );
};

export default Footer;
