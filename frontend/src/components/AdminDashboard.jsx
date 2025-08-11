import React, { useState, useEffect } from 'react';
import { authService, dashboardService } from '../services/api';
import socketService from '../services/socketService';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('queue');
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // Établir la connexion Socket.IO
    const socket = socketService.connect();
    socketService.joinAdminRoom();
    setSocketConnected(socketService.getConnectionStatus());

    // Écouter les événements en temps réel
    socketService.onTicketUpdated((data) => {
      console.log('🔄 Ticket mis à jour:', data);
      addNotification(`Ticket ${data.ticketId} : ${data.oldStatus} → ${data.newStatus}`, 'info');
      if (activeTab === 'queue') {
        loadData();
      }
    });

    socketService.onTicketCalled((data) => {
      console.log('📢 Ticket appelé:', data);
      addNotification(data.message, 'success');
      if (activeTab === 'queue') {
        loadData();
      }
    });

    socketService.onNotificationSent((data) => {
      console.log('🔔 Notification envoyée:', data);
      addNotification(data.message, 'info');
    });

    // Vérifier la connexion périodiquement
    const connectionCheck = setInterval(() => {
      setSocketConnected(socketService.getConnectionStatus());
    }, 5000);

    loadData();

    return () => {
      clearInterval(connectionCheck);
      socketService.removeAllListeners();
      socketService.leaveAdminRoom();
    };
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Garder max 5 notifications
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'queue') {
        const response = await dashboardService.getQueue();
        setQueue(response.data.queue);
      } else if (activeTab === 'stats') {
        const response = await dashboardService.getStats();
        setStats(response.data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await dashboardService.updateTicketStatus(ticketId, newStatus);
      // Les données seront mises à jour via Socket.IO
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleCallNext = async () => {
    try {
      await dashboardService.callNextTicket();
      // Le résultat sera affiché via Socket.IO
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    }
  };

  const handleForceNotification = async (ticketId) => {
    try {
      await dashboardService.forceNotification(ticketId);
      // La notification sera affichée via Socket.IO
    } catch (err) {
      setError('Erreur lors de l\'envoi de la notification');
    }
  };

  const handleExport = async () => {
    try {
      const response = await dashboardService.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tickets_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erreur lors de l\'export');
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    authService.logout();
    onLogout();
  };

  return (
    <>
      {/* Header Admin */}
      <header className="header">
        <div className="header-content">
          <span className="logo">🔴 Tunisie Telecom - Admin</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Indicateur de connexion */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              background: socketConnected ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
              borderRadius: '15px',
              fontSize: '0.8rem'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: socketConnected ? '#28a745' : '#dc3545',
                display: 'inline-block'
              }}></span>
              {socketConnected ? 'Temps réel' : 'Déconnecté'}
            </div>
            
            <span style={{ fontSize: '0.9rem', opacity: '0.9' }}>
              Bonjour {currentUser?.prenom} {currentUser?.nom}
            </span>
            <button 
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Notifications en temps réel */}
      {notifications.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          top: '80px', 
          right: '20px', 
          zIndex: 1000,
          maxWidth: '400px'
        }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                background: notification.type === 'success' ? '#d4edda' : 
                           notification.type === 'error' ? '#f8d7da' : '#d1ecf1',
                color: notification.type === 'success' ? '#155724' : 
                       notification.type === 'error' ? '#721c24' : '#0c5460',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {notification.type === 'success' ? '✅' : 
                 notification.type === 'error' ? '❌' : 'ℹ️'} Notification
              </div>
              <div style={{ fontSize: '0.9rem' }}>{notification.message}</div>
              <div style={{ fontSize: '0.75rem', opacity: '0.7', marginTop: '0.25rem' }}>
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--tt-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            {[
              { id: 'queue', label: '🎟️ File d\'attente', icon: '🎟️' },
              { id: 'stats', label: '📊 Statistiques', icon: '📊' },
              { id: 'actions', label: '⚡ Actions', icon: '⚡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 0',
                  borderBottom: activeTab === tab.id ? '2px solid var(--tt-primary)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--tt-primary)' : 'var(--tt-text)',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container" style={{ maxWidth: '1200px' }}>
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading" style={{ width: '40px', height: '40px' }}></div>
            <p>Chargement...</p>
          </div>
        )}

        {/* File d'attente */}
        {activeTab === 'queue' && !loading && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">File d'attente actuelle</h2>
              <p className="card-subtitle">{queue.length} tickets en cours</p>
            </div>

            {queue.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--tt-text-light)' }}>
                Aucun ticket en attente
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--tt-border)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Ticket</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Agence</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Service</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Heure</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map(ticket => (
                      <tr key={ticket.id} style={{ borderBottom: '1px solid var(--tt-border)' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--tt-primary)' }}>
                          A-{ticket.id.toString().padStart(3, '0')}
                        </td>
                        <td style={{ padding: '1rem' }}>{ticket.agence}</td>
                        <td style={{ padding: '1rem' }}>{ticket.service}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            background: ticket.status === 'en_cours' ? 'var(--tt-success)' : 'var(--tt-secondary)',
                            color: 'white'
                          }}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {new Date(ticket.heure_arrivee).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                              value={ticket.status}
                              onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                              style={{
                                padding: '0.25rem',
                                border: '1px solid var(--tt-border)',
                                borderRadius: '4px'
                              }}
                            >
                              <option value="en_attente">En attente</option>
                              <option value="en_cours">En cours</option>
                              <option value="termine">Terminé</option>
                            </select>
                            {ticket.status === 'en_attente' && (
                              <button
                                onClick={() => handleForceNotification(ticket.id)}
                                style={{
                                  background: 'var(--tt-success)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                                title="Envoyer notification"
                              >
                                🔔
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Statistiques */}
        {activeTab === 'stats' && !loading && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Tickets total', value: stats.totalTickets || 0, color: 'var(--tt-primary)' },
                { label: 'En attente', value: stats.ticketsEnAttente || 0, color: 'var(--tt-secondary)' },
                { label: 'En cours', value: stats.ticketsEnCours || 0, color: 'var(--tt-success)' },
                { label: 'Terminés', value: stats.ticketsTermines || 0, color: 'var(--tt-text-light)' }
              ].map(stat => (
                <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '0.5rem' }}>
                    {stat.value}
                  </div>
                  <div style={{ color: 'var(--tt-text-light)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Statistiques des notifications */}
            {stats.notifications && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                  <h3 className="card-title">🔔 Notifications automatiques</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--tt-success)' }}>
                      {stats.notifications.notifiedTicketsCount || 0}
                    </div>
                    <div style={{ color: 'var(--tt-text-light)' }}>Notifications envoyées</div>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Statistiques détaillées</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: 'var(--tt-primary)', marginBottom: '1rem' }}>Par service</h4>
                  {Object.entries(stats.serviceStats || {}).map(([service, count]) => (
                    <div key={service} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>{service}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ color: 'var(--tt-primary)', marginBottom: '1rem' }}>Par agence</h4>
                  {Object.entries(stats.agenceStats || {}).map(([agence, count]) => (
                    <div key={agence} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>{agence}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {activeTab === 'actions' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Actions rapides</h2>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <button
                onClick={handleCallNext}
                className="btn btn-primary"
                style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
              >
                📢 Appeler le prochain ticket
              </button>

              <button
                onClick={handleExport}
                className="btn"
                style={{
                  background: 'var(--tt-success)',
                  color: 'white',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem'
                }}
              >
                📁 Exporter les données (CSV)
              </button>

              <button
                onClick={loadData}
                className="btn"
                style={{
                  background: 'var(--tt-text-light)',
                  color: 'white',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem'
                }}
              >
                🔄 Actualiser les données
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default AdminDashboard;
