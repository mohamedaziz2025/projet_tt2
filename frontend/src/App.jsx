import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import TicketForm from './components/TicketForm';
import TicketResult from './components/TicketResult';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { authService } from './services/api';
import './index.css';

function App() {
  const [ticket, setTicket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleTicketCreated = (ticketData) => {
    setTicket(ticketData);
  };

  const handleNewTicket = () => {
    setTicket(null);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Route publique - Réservation de ticket */}
        <Route 
          path="/" 
          element={
            <>
              <Header />
              <div className="container">
                {ticket ? (
                  <TicketResult 
                    ticket={ticket} 
                    onNewTicket={handleNewTicket} 
                  />
                ) : (
                  <TicketForm 
                    onTicketCreated={handleTicketCreated} 
                  />
                )}
              </div>
            </>
          } 
        />

        {/* Route admin - Connexion */}
        <Route 
          path="/admin/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/admin/dashboard" replace /> : 
              <AdminLogin onLogin={handleLogin} />
          } 
        />

        {/* Route admin - Dashboard */}
        <Route 
          path="/admin/dashboard" 
          element={
            isAuthenticated ? 
              <AdminDashboard onLogout={handleLogout} /> : 
              <Navigate to="/admin/login" replace />
          } 
        />

        {/* Redirection par défaut */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
