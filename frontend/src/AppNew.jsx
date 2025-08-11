import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import HeaderNew from './components/HeaderNew';
import TicketFormNew from './components/TicketFormNew';
import TicketResult from './components/TicketResult';
import AdminLoginNew from './components/AdminLoginNew';
import AdminDashboardNew from './components/AdminDashboardNew';
import FooterNew from './components/FooterNew';
import { authService } from './services/api';
import './styles/global.css';

// Composant wrapper pour la HomePage qui peut utiliser useNavigate
const HomePageWrapper = () => {
  const navigate = useNavigate();

  const handleNavigateToTicket = (preSelectedService = null, preSelectedAgence = null) => {
    // S'assurer qu'on ne passe que des valeurs simples, pas des objets d'événement
    const serviceValue = typeof preSelectedService === 'string' ? preSelectedService : null;
    const agenceValue = typeof preSelectedAgence === 'string' ? preSelectedAgence : null;
    
    navigate('/ticket', { 
      state: { 
        preSelectedService: serviceValue, 
        preSelectedAgence: agenceValue 
      } 
    });
  };

  const handleNavigateToAdmin = () => {
    navigate('/admin/login');
  };

  return (
    <HomePage 
      onNavigateToTicket={handleNavigateToTicket}
      onNavigateToAdmin={handleNavigateToAdmin}
    />
  );
};

// Composant wrapper pour le formulaire de ticket
const TicketFormWrapper = () => {
  const [ticket, setTicket] = useState(null);
  const navigate = useNavigate();

  const handleTicketCreated = (ticketData) => {
    setTicket(ticketData);
  };

  const handleNewTicket = () => {
    setTicket(null);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <>
      <HeaderNew onNavigateToHome={handleGoHome} showBackButton />
      <div className="container">
        {ticket ? (
          <TicketResult 
            ticket={ticket} 
            onNewTicket={handleNewTicket}
            onGoHome={handleGoHome}
          />
        ) : (
          <TicketFormNew 
            onTicketCreated={handleTicketCreated} 
          />
        )}
      </div>
      <FooterNew />
    </>
  );
};

// Composant wrapper pour AdminLogin qui peut utiliser useNavigate
const AdminLoginWrapper = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleNavigateToHome = () => {
    navigate('/');
  };

  const handleLoginSuccess = () => {
    onLogin();
    navigate('/admin/dashboard');
  };

  return (
    <AdminLoginNew 
      onNavigateToHome={handleNavigateToHome}
      onLoginSuccess={handleLoginSuccess}
    />
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    authService.logout();
  };

  return (
    <Router>
      <Routes>
        {/* Page d'accueil avec vitrine moderne */}
        <Route 
          path="/" 
          element={<HomePageWrapper />} 
        />

        {/* Route ticket - Réservation */}
        <Route 
          path="/ticket" 
          element={<TicketFormWrapper />} 
        />

        {/* Route admin - Connexion */}
        <Route 
          path="/admin/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/admin/dashboard" replace /> : 
              <AdminLoginWrapper onLogin={handleLogin} />
          } 
        />

        {/* Route admin - Dashboard */}
        <Route 
          path="/admin/dashboard" 
          element={
            isAuthenticated ? 
              <AdminDashboardNew onLogout={handleLogout} /> : 
              <Navigate to="/admin/login" replace />
          } 
        />

        {/* Redirections */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
