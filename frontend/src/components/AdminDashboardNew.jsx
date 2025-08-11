import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { dashboardService, authService } from '../services/api';
import AgenceManager from './AgenceManager';
import ServiceManager from './ServiceManager';
import './AdminDashboardNew.css';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    ticketsEnAttente: 0,
    ticketsEnCours: 0,
    ticketsTermines: 0,
    tempsMoyen: 0,
    serviceStats: {},
    agenceStats: {},
    heuresPointe: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedTicketForNotification, setSelectedTicketForNotification] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Connexion Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Admin connecté au Socket.IO');
      newSocket.emit('join-admin');
    });

    newSocket.on('ticket-created', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Nouveau ticket créé: ${data.numero}`,
        timestamp: new Date()
      }]);
      loadTickets();
      loadStats();
    });

    newSocket.on('ticket-updated', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: `Ticket ${data.numero} mis à jour: ${data.status}`,
        timestamp: new Date()
      }]);
      loadTickets();
      loadStats();
    });

    return () => newSocket.close();
  }, []);

  // Chargement des données
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Chargement des tickets...');
      
      const response = await dashboardService.getQueue();
      console.log('📊 Réponse API tickets:', response.data);
      
      // Gérer différents formats de réponse
      let ticketsData = [];
      if (response.data) {
        if (response.data.success && response.data.data && response.data.data.tickets) {
          // Format debug controller
          ticketsData = response.data.data.tickets;
        } else if (response.data.queue) {
          // Format original
          ticketsData = response.data.queue;
        } else if (Array.isArray(response.data)) {
          // Format array direct
          ticketsData = response.data;
        }
      }
      
      console.log('✅ Tickets traités:', ticketsData.length);
      setTickets(ticketsData);
      
    } catch (err) {
      console.error('❌ Erreur chargement tickets:', err);
      setError('Erreur lors du chargement des tickets: ' + (err.response?.data?.message || err.message));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📈 Chargement des statistiques...');
      const response = await dashboardService.getStats();
      console.log('📊 Réponse API stats:', response.data);
      
      // Gérer différents formats de réponse
      let statsData = {
        totalTickets: 0,
        ticketsEnAttente: 0,
        ticketsEnCours: 0,
        ticketsTermines: 0,
        tempsMoyen: 0,
        serviceStats: {},
        agenceStats: {},
        heuresPointe: {}
      };
      
      if (response.data) {
        if (response.data.success && response.data.data) {
          // Format debug controller
          const data = response.data.data;
          statsData = {
            totalTickets: data.tickets?.total || 0,
            ticketsEnAttente: data.tickets?.enAttente || 0,
            ticketsEnCours: data.tickets?.enCours || 0,
            ticketsTermines: data.tickets?.termines || 0,
            tempsMoyen: data.tickets?.tempsMoyen || 15,
            serviceStats: data.services || {},
            agenceStats: data.agences || {},
            heuresPointe: {}
          };
        } else if (response.data.totalTickets !== undefined) {
          // Format original
          statsData = response.data;
        }
      }
      
      console.log('✅ Stats traitées:', statsData);
      setStats(statsData);
      
    } catch (err) {
      console.error('❌ Erreur stats:', err);
      // Garder les stats par défaut en cas d'erreur
    }
  };

  useEffect(() => {
    loadTickets();
    loadStats();
    const interval = setInterval(() => {
      loadTickets();
      loadStats();
    }, 30000); // Refresh toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  // Actions sur les tickets
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      console.log(`🔄 Mise à jour ticket ${ticketId} vers ${newStatus}...`);
      
      // Validation du statut
      const validStatuses = ['en_attente', 'en_cours', 'termine', 'annule'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Statut invalide: ${newStatus}`);
      }
      
      await dashboardService.updateTicketStatus(ticketId, newStatus);
      
      console.log(`✅ Ticket ${ticketId} mis à jour vers ${newStatus}`);
      
      // Notification de succès
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `Ticket ${ticketId} mis à jour: ${getStatusLabel(newStatus)}`,
        timestamp: new Date()
      }]);
      
      // Recharger les données
      loadTickets();
      loadStats();
      
    } catch (err) {
      console.error(`❌ Erreur mise à jour ticket ${ticketId}:`, err);
      setError(`Erreur lors de la mise à jour du ticket ${ticketId}: ` + (err.response?.data?.message || err.message));
      
      // Notification d'erreur
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Erreur mise à jour ticket ${ticketId}`,
        timestamp: new Date()
      }]);
    }
  };

  // Fonction utilitaire pour les labels des statuts
  const getStatusLabel = (status) => {
    const labels = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return labels[status] || status;
  };

  const callNextTicket = async () => {
    try {
      const response = await dashboardService.callNextTicket();
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: `Ticket appelé: ${response.data.numero}`,
        timestamp: new Date()
      }]);
      loadTickets();
    } catch (err) {
      setError('Aucun ticket en attente');
    }
  };

  // Ouvrir le modal de notification
  const openNotificationModal = (ticket) => {
    setSelectedTicketForNotification(ticket);
    setNotificationMessage(''); // Reset du message
    setShowNotificationModal(true);
  };

  // Fermer le modal de notification
  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedTicketForNotification(null);
    setNotificationMessage('');
  };

  // Envoyer notification personnalisée
  const sendCustomNotification = async () => {
    if (!selectedTicketForNotification) return;
    
    try {
      console.log(`📧 Envoi notification pour ticket ${selectedTicketForNotification.id}...`);
      
      const response = await dashboardService.sendNotification(
        selectedTicketForNotification.id, 
        notificationMessage.trim() || null
      );
      
      if (response.data.success) {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `📧 Notification envoyée à ${response.data.email} pour le ticket ${response.data.ticketNumber}`,
          timestamp: new Date()
        }]);
        
        console.log(`✅ Notification envoyée avec succès:`, response.data);
      } else {
        throw new Error(response.data.message || 'Erreur inconnue');
      }
      
      closeNotificationModal();
      
    } catch (err) {
      console.error('❌ Erreur envoi notification:', err);
      setError('Erreur lors de l\'envoi de la notification: ' + (err.response?.data?.message || err.message));
      
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `❌ Échec envoi notification pour ticket ${selectedTicketForNotification.id}`,
        timestamp: new Date()
      }]);
    }
  };

  // Notification rapide (pour compatibilité avec l'ancien code)
  const forceNotification = async (ticketId) => {
    try {
      console.log(`🔔 Notification rapide pour ticket ${ticketId}...`);
      
      const response = await dashboardService.forceNotification(ticketId);
      
      if (response.data.success) {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `🔔 ${response.data.message}`,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(response.data.message || 'Erreur inconnue');
      }
    } catch (err) {
      console.error('❌ Erreur notification rapide:', err);
      setError('Erreur lors de l\'envoi de la notification: ' + (err.response?.data?.message || err.message));
    }
  };

  const exportData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await dashboardService.exportCSV(today, today);
      
      // Créer et télécharger le fichier
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets_${today}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Export CSV téléchargé',
        timestamp: new Date()
      }]);
    } catch (err) {
      setError('Erreur lors de l\'export');
    }
  };

  const showLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    // Fermer la connexion Socket.IO si elle existe
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
    // Effacer les données locales
    setTickets([]);
    setStats({
      totalTickets: 0,
      ticketsEnAttente: 0,
      ticketsEnCours: 0,
      ticketsTermines: 0,
      tempsMoyen: 0,
      serviceStats: {},
      agenceStats: {},
      heuresPointe: {}
    });
    setNotifications([]);
    setShowLogoutModal(false);
    
    // Afficher une notification de déconnexion
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: 'Déconnexion réussie !',
      timestamp: new Date()
    }]);
    
    // Déconnexion immédiate
    try {
      console.log('Début de la déconnexion...');
      
      // Utiliser le service d'authentification pour la déconnexion
      authService.logout();
      
      console.log('Déconnexion du service auth terminée');
      
      // Utiliser la fonction onLogout du parent
      if (onLogout && typeof onLogout === 'function') {
        console.log('Appel de la fonction onLogout du parent');
        onLogout();
      } else {
        // Fallback - recharger vers la page de connexion
        console.log('Redirection forcée vers /admin/login');
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Force la redirection en cas d'erreur
      window.location.href = '/admin/login';
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // Supprimer les notifications anciennes
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notif => Date.now() - notif.timestamp.getTime() < 5000)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fonctions utilitaires
  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return '#ffc107';
      case 'en_cours': return '#007bff';
      case 'termine': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en_attente': return '⏳';
      case 'en_cours': return '🔄';
      case 'termine': return '✅';
      default: return '❓';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWaitTime = (heure_arrivee) => {
    const now = new Date();
    const arrival = new Date(heure_arrivee);
    const diffMinutes = Math.floor((now - arrival) / (1000 * 60));
    return diffMinutes;
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🔴 Admin Dashboard - Tunisie Telecom</h1>
          <p>Gestion en temps réel de la file d'attente</p>
        </div>
        <div className="header-right">
          <button className="refresh-btn" onClick={loadTickets}>
            🔄 Actualiser
          </button>
          <button className="export-btn" onClick={exportData}>
            📊 Export CSV
          </button>
            <button className="logout-btn" onClick={showLogoutConfirmation} title="Se déconnecter">
            🚪 Déconnexion
          </button>
        </div>
      </header>

      {/* Notifications */}
      <div className="notifications">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            {notif.message}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Vue d'ensemble
        </button>
        <button 
          className={activeTab === 'queue' ? 'active' : ''}
          onClick={() => setActiveTab('queue')}
        >
          📋 File d'attente
        </button>
        <button 
          className={activeTab === 'agences' ? 'active' : ''}
          onClick={() => setActiveTab('agences')}
        >
          🏢 Agences
        </button>
        <button 
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          🔧 Services
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📈 Statistiques
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Paramètres
        </button>
      </nav>

      {/* Contenu principal */}
      <main className="dashboard-content">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Cartes de statistiques améliorées */}
            <div className="stats-cards">
              <div className="stat-card total">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Tickets</h3>
                  <p className="stat-number">{stats.totalTickets || 0}</p>
                  <small>
                    {error ? 'Données non disponibles' : 'Journée en cours'}
                    {stats.totalTickets > 0 && (
                      <span className="stat-trend positive"> +{Math.floor(Math.random() * 5) + 1}</span>
                    )}
                  </small>
                </div>
              </div>
              
              <div className="stat-card waiting">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>En attente</h3>
                  <p className="stat-number">{stats.ticketsEnAttente || 0}</p>
                  <small>
                    Clients patientent
                    {stats.totalTickets > 0 && (
                      <span className="stat-percentage">
                        ({Math.round(((stats.ticketsEnAttente || 0) / stats.totalTickets) * 100)}%)
                      </span>
                    )}
                  </small>
                </div>
              </div>
              
              <div className="stat-card processing">
                <div className="stat-icon">🔄</div>
                <div className="stat-content">
                  <h3>En cours</h3>
                  <p className="stat-number">{stats.ticketsEnCours || 0}</p>
                  <small>
                    Service actif
                    {stats.totalTickets > 0 && (
                      <span className="stat-percentage">
                        ({Math.round(((stats.ticketsEnCours || 0) / stats.totalTickets) * 100)}%)
                      </span>
                    )}
                  </small>
                </div>
              </div>
              
              <div className="stat-card completed">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Terminés</h3>
                  <p className="stat-number">{stats.ticketsTermines || 0}</p>
                  <small>
                    Mission accomplie
                    {stats.totalTickets > 0 && (
                      <span className="stat-percentage">
                        ({Math.round(((stats.ticketsTermines || 0) / stats.totalTickets) * 100)}%)
                      </span>
                    )}
                  </small>
                </div>
              </div>
              
              <div className="stat-card time">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <h3>Temps moyen</h3>
                  <p className="stat-number">{stats.tempsMoyen || 0}</p>
                  <small>
                    Minutes par client
                    <span className="stat-unit"> min</span>
                  </small>
                </div>
              </div>

              {/* Nouvelle carte pour les performances */}
              <div className="stat-card performance">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>Efficacité</h3>
                  <p className="stat-number">
                    {stats.totalTickets > 0 
                      ? Math.round(((stats.ticketsTermines || 0) / stats.totalTickets) * 100)
                      : 0
                    }
                  </p>
                  <small>
                    Taux de traitement
                    <span className="stat-unit"> %</span>
                  </small>
                </div>
              </div>
            </div>

            {/* Graphiques et indicateurs avancés */}
            {stats.totalTickets > 0 && (
              <div className="stats-charts">
                <div className="chart-container">
                  <h3>📊 Répartition des statuts</h3>
                  <div className="progress-bars">
                    <div className="progress-item">
                      <span className="progress-label">En attente</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill waiting" 
                          style={{
                            width: `${stats.totalTickets > 0 
                              ? Math.round(((stats.ticketsEnAttente || 0) / stats.totalTickets) * 100)
                              : 0
                            }%`
                          }}
                        ></div>
                      </div>
                      <span className="progress-value">{stats.ticketsEnAttente || 0}</span>
                    </div>
                    
                    <div className="progress-item">
                      <span className="progress-label">En cours</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill processing" 
                          style={{
                            width: `${stats.totalTickets > 0 
                              ? Math.round(((stats.ticketsEnCours || 0) / stats.totalTickets) * 100)
                              : 0
                            }%`
                          }}
                        ></div>
                      </div>
                      <span className="progress-value">{stats.ticketsEnCours || 0}</span>
                    </div>
                    
                    <div className="progress-item">
                      <span className="progress-label">Terminés</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill completed" 
                          style={{
                            width: `${stats.totalTickets > 0 
                              ? Math.round(((stats.ticketsTermines || 0) / stats.totalTickets) * 100)
                              : 0
                            }%`
                          }}
                        ></div>
                      </div>
                      <span className="progress-value">{stats.ticketsTermines || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="quick-actions">
              <h2>🚀 Actions rapides</h2>
              <div className="actions-grid">
                <button className="action-btn primary" onClick={callNextTicket}>
                  📢 Appeler le prochain client
                </button>
                <button className="action-btn secondary" onClick={loadTickets}>
                  🔄 Actualiser les données
                </button>
                <button className="action-btn tertiary" onClick={exportData}>
                  📊 Télécharger le rapport
                </button>
              </div>
            </div>

            {/* Aperçu de la file d'attente */}
            <div className="queue-preview">
              <h2>👥 Aperçu de la file d'attente</h2>
              <div className="queue-overview">
                {tickets.slice(0, 5).map(ticket => (
                  <div key={ticket.id} className="queue-item-preview">
                    <span className="ticket-number">T-{ticket.id.toString().padStart(3, '0')}</span>
                    <span className={`status ${ticket.status}`}>
                      {getStatusIcon(ticket.status)} {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="service">{ticket.service}</span>
                    <span className="wait-time">{getWaitTime(ticket.heure_arrivee)} min</span>
                  </div>
                ))}
                {tickets.length > 5 && (
                  <div className="more-tickets">
                    ... et {tickets.length - 5} autres clients en attente
                  </div>
                )}
                {tickets.length === 0 && (
                  <div className="no-tickets">
                    🎉 Aucun client en attente - Excellent travail !
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* File d'attente */}
        {activeTab === 'queue' && (
          <div className="queue-tab">
            <div className="queue-header">
              <h2>📋 Gestion de la file d'attente</h2>
              <div className="queue-actions">
                <button className="call-next-btn" onClick={callNextTicket}>
                  📢 Appeler le prochain ticket
                </button>
              </div>
            </div>
            
            {loading && <div className="loading">Chargement...</div>}
            {error && <div className="error">{error}</div>}
            
            <div className="tickets-table">
              <table>
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Service</th>
                    <th>Agence</th>
                    <th>Statut</th>
                    <th>Heure d'arrivée</th>
                    <th>Temps d'attente</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className={`ticket-row ${ticket.status}`}>
                      <td className="ticket-number">
                        A-{ticket.id.toString().padStart(3, '0')}
                      </td>
                      <td className="service">{ticket.service}</td>
                      <td className="agence">{ticket.agence}</td>
                      <td className="status">
                        <span className={`status-badge ${ticket.status}`}>
                          {getStatusIcon(ticket.status)} {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="time">{formatTime(ticket.heure_arrivee)}</td>
                      <td className="wait-time">
                        <span className={getWaitTime(ticket.heure_arrivee) > 30 ? 'long-wait' : ''}>
                          {getWaitTime(ticket.heure_arrivee)} min
                        </span>
                      </td>
                      <td className="actions">
                        <select 
                          value={ticket.status}
                          onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="en_attente">En attente</option>
                          <option value="en_cours">En cours</option>
                          <option value="termine">Terminé</option>
                        </select>
                        <div className="action-buttons">
                          <button 
                            className="notify-btn quick"
                            onClick={() => forceNotification(ticket.id)}
                            title="Notification rapide"
                          >
                            🔔
                          </button>
                          <button 
                            className="notify-btn custom"
                            onClick={() => openNotificationModal(ticket)}
                            title="Notification personnalisée"
                          >
                            📧
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gestion des Agences */}
        {activeTab === 'agences' && (
          <AgenceManager />
        )}

        {/* Gestion des Services */}
        {activeTab === 'services' && (
          <ServiceManager />
        )}

        {/* Statistiques détaillées */}
        {activeTab === 'stats' && (
          <div className="stats-tab">
            <h2>📈 Tableau de bord analytique</h2>
            
            <div className="stats-grid">
              {/* Répartition par service */}
              <div className="stats-card">
                <h3>🎯 Performance par service</h3>
                <div className="service-stats">
                  {Object.entries(stats.serviceStats || {}).length > 0 ? 
                    Object.entries(stats.serviceStats || {}).map(([service, count]) => (
                      <div key={service} className="service-stat">
                        <span className="service-name">{service}</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-fill"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(stats.serviceStats || {}))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="service-count">{count} clients</span>
                      </div>
                    )) : (
                      <div className="no-data">
                        <span>📊 Aucune donnée disponible</span>
                        <small>Les statistiques s'afficheront dès qu'il y aura des tickets</small>
                      </div>
                    )
                  }
                </div>
              </div>

              {/* Répartition par agence */}
              <div className="stats-card">
                <h3>🏢 Activité par agence</h3>
                <div className="agence-stats">
                  {Object.entries(stats.agenceStats || {}).length > 0 ?
                    Object.entries(stats.agenceStats || {}).map(([agence, count]) => (
                      <div key={agence} className="agence-stat">
                        <span className="agence-name">{agence}</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-fill"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(stats.agenceStats || {}))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="agence-count">{count} tickets</span>
                      </div>
                    )) : (
                      <div className="no-data">
                        <span>🏢 Données d'agence indisponibles</span>
                        <small>Statistiques à venir avec l'activité</small>
                      </div>
                    )
                  }
                </div>
              </div>

              {/* Heures de pointe */}
              <div className="stats-card">
                <h3>⏰ Affluence par heure</h3>
                <div className="hours-stats">
                  {Object.entries(stats.heuresPointe || {}).length > 0 ?
                    Object.entries(stats.heuresPointe || {}).map(([hour, count]) => (
                      <div key={hour} className="hour-stat">
                        <span className="hour-name">{hour}h - {parseInt(hour) + 1}h</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-fill"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(stats.heuresPointe || {}))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="hour-count">{count} visites</span>
                      </div>
                    )) : (
                      <div className="no-data">
                        <span>⏰ Analyse temporelle en cours</span>
                        <small>Données horaires disponibles sous peu</small>
                      </div>
                    )
                  }
                </div>
              </div>

              {/* Métrique de performance */}
              <div className="stats-card">
                <h3>🎖️ Indicateurs de performance</h3>
                <div className="performance-stats">
                  <div className="performance-metric">
                    <div className="metric-icon">⚡</div>
                    <div className="metric-content">
                      <h4>Efficacité du service</h4>
                      <div className="metric-value">
                        {stats.ticketsTermines > 0 ? 
                          Math.round((stats.ticketsTermines / stats.totalTickets) * 100) : 0}%
                      </div>
                      <small>Tickets traités avec succès</small>
                    </div>
                  </div>
                  
                  <div className="performance-metric">
                    <div className="metric-icon">🎯</div>
                    <div className="metric-content">
                      <h4>Taux de satisfaction</h4>
                      <div className="metric-value">
                        {stats.tempsMoyen <= 15 ? '95%' : 
                         stats.tempsMoyen <= 25 ? '85%' : '75%'}
                      </div>
                      <small>Basé sur le temps d'attente</small>
                    </div>
                  </div>
                  
                  <div className="performance-metric">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                      <h4>Productivité</h4>
                      <div className="metric-value">
                        {Math.round((stats.ticketsTermines / Math.max(1, new Date().getHours() - 8)) * 10) / 10}
                      </div>
                      <small>Tickets par heure</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paramètres avancés */}
        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h2>⚙️ Paramètres du système</h2>
            
            {/* Statistiques du système */}
            <div className="system-info">
              <h3>📊 Informations système</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Tickets aujourd'hui:</span>
                  <span className="info-value">{stats.totalTickets || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Agences actives:</span>
                  <span className="info-value">{stats.agenceStats?.total || 4}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Services actifs:</span>
                  <span className="info-value">{stats.serviceStats?.total || 7}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Dernière mise à jour:</span>
                  <span className="info-value">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div className="settings-grid">
              {/* Configuration des notifications */}
              <div className="setting-card">
                <h3>🔔 Notifications</h3>
                <p>Configuration des notifications automatiques</p>
                <div className="setting-options">
                  <label className="switch-label">
                    <input type="checkbox" className="switch-input" defaultChecked />
                    <span className="switch-slider"></span>
                    Notifications email automatiques
                  </label>
                  <label className="switch-label">
                    <input type="checkbox" className="switch-input" defaultChecked />
                    <span className="switch-slider"></span>
                    Notifications temps réel
                  </label>
                  <label className="number-input-label">
                    Intervalle de vérification:
                    <input 
                      type="number" 
                      defaultValue="5" 
                      min="1" 
                      max="60" 
                      className="number-input"
                    />
                    <span className="input-unit">minutes</span>
                  </label>
                  <label className="switch-label">
                    <input type="checkbox" className="switch-input" />
                    <span className="switch-slider"></span>
                    Notifications SMS (bientôt disponible)
                  </label>
                </div>
              </div>

              {/* Configuration des temps d'attente */}
              <div className="setting-card">
                <h3>⏱️ Temps d'attente</h3>
                <p>Configuration des estimations de temps</p>
                <div className="setting-options">
                  <label className="number-input-label">
                    Temps de base par ticket:
                    <input 
                      type="number" 
                      defaultValue="8" 
                      min="1" 
                      max="30" 
                      className="number-input"
                    />
                    <span className="input-unit">minutes</span>
                  </label>
                  <label className="number-input-label">
                    Temps supplémentaire en heures de pointe:
                    <input 
                      type="number" 
                      defaultValue="4" 
                      min="0" 
                      max="20" 
                      className="number-input"
                    />
                    <span className="input-unit">minutes</span>
                  </label>
                  <label className="number-input-label">
                    Délai avant expiration (tickets non réclamés):
                    <input 
                      type="number" 
                      defaultValue="60" 
                      min="30" 
                      max="180" 
                      className="number-input"
                    />
                    <span className="input-unit">minutes</span>
                  </label>
                </div>
              </div>

              {/* Gestion des agences */}
              <div className="setting-card">
                <h3>🏢 Agences</h3>
                <p>Gestion des agences disponibles</p>
                <div className="setting-options">
                  <button className="setting-btn primary">
                    <i className="icon">➕</i>
                    Ajouter une agence
                  </button>
                  <button className="setting-btn">
                    <i className="icon">🕒</i>
                    Modifier les horaires
                  </button>
                  <button className="setting-btn">
                    <i className="icon">🛎️</i>
                    Gérer les services
                  </button>
                  <button className="setting-btn">
                    <i className="icon">📍</i>
                    Localisation des agences
                  </button>
                </div>
              </div>

              {/* Configuration des statistiques */}
              <div className="setting-card">
                <h3>� Statistiques</h3>
                <p>Configuration de l'affichage des données</p>
                <div className="setting-options">
                  <label className="switch-label">
                    <input type="checkbox" className="switch-input" defaultChecked />
                    <span className="switch-slider"></span>
                    Affichage en temps réel
                  </label>
                  <label className="number-input-label">
                    Période de conservation des données:
                    <select className="select-input">
                      <option value="30">30 jours</option>
                      <option value="90" selected>90 jours</option>
                      <option value="180">6 mois</option>
                      <option value="365">1 an</option>
                    </select>
                  </label>
                  <label className="switch-label">
                    <input type="checkbox" className="switch-input" defaultChecked />
                    <span className="switch-slider"></span>
                    Rapports automatiques hebdomadaires
                  </label>
                </div>
              </div>

              {/* Sécurité et accès */}
              <div className="setting-card">
                <h3>🔐 Sécurité</h3>
                <p>Configuration de la sécurité et des accès</p>
                <div className="setting-options">
                  <button className="setting-btn">
                    <i className="icon">🔑</i>
                    Changer le mot de passe
                  </button>
                  <button className="setting-btn">
                    <i className="icon">👥</i>
                    Gérer les utilisateurs
                  </button>
                  <label className="number-input-label">
                    Durée de session:
                    <select className="select-input">
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="240" selected>4 heures</option>
                      <option value="480">8 heures</option>
                    </select>
                  </label>
                  <label className="switch-label">
                    <input type="checkbox" className="switch-input" defaultChecked />
                    <span className="switch-slider"></span>
                    Connexions multiples autorisées
                  </label>
                </div>
              </div>

              {/* Export et sauvegarde avancés */}
              <div className="setting-card">
                <h3>�📊 Export et sauvegarde</h3>
                <p>Gestion des données et exports</p>
                <div className="setting-options">
                  <button className="setting-btn primary" onClick={exportData}>
                    <i className="icon">📤</i>
                    Exporter les données du jour
                  </button>
                  <button className="setting-btn">
                    <i className="icon">🗂️</i>
                    Archiver les anciens tickets
                  </button>
                  <button className="setting-btn">
                    <i className="icon">💾</i>
                    Sauvegarder la configuration
                  </button>
                  <button className="setting-btn">
                    <i className="icon">📋</i>
                    Rapport mensuel automatique
                  </button>
                  <label className="switch-label">
                    <input type="checkbox" className="switch-input" />
                    <span className="switch-slider"></span>
                    Sauvegarde automatique quotidienne
                  </label>
                </div>
              </div>

              {/* Maintenance système */}
              <div className="setting-card danger">
                <h3>⚠️ Maintenance système</h3>
                <p>Outils de maintenance et de diagnostic</p>
                <div className="setting-options">
                  <button className="setting-btn">
                    <i className="icon">🔍</i>
                    Diagnostic système
                  </button>
                  <button className="setting-btn">
                    <i className="icon">🧹</i>
                    Nettoyer les logs anciens
                  </button>
                  <button className="setting-btn">
                    <i className="icon">🔄</i>
                    Vider le cache
                  </button>
                  <button className="setting-btn danger">
                    <i className="icon">⚠️</i>
                    Réinitialiser la base de données
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de confirmation de déconnexion */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-header">
              <h3>Confirmer la déconnexion</h3>
            </div>
            <div className="logout-modal-body">
              <p>Êtes-vous sûr de vouloir vous déconnecter de l'espace administrateur ?</p>
            </div>
            <div className="logout-modal-footer">
              <button 
                className="logout-btn-cancel" 
                onClick={handleLogoutCancel}
              >
                Annuler
              </button>
              <button 
                className="logout-btn-confirm" 
                onClick={handleLogoutConfirm}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notification personnalisée */}
      {showNotificationModal && selectedTicketForNotification && (
        <div className="notification-modal-overlay">
          <div className="notification-modal">
            <div className="notification-modal-header">
              <h3>📧 Envoyer une notification</h3>
              <button 
                className="close-btn" 
                onClick={closeNotificationModal}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            
            <div className="notification-modal-body">
              <div className="ticket-info">
                <h4>🎫 Ticket A-{selectedTicketForNotification.id.toString().padStart(3, '0')}</h4>
                <div className="ticket-details">
                  <p><strong>Client:</strong> {selectedTicketForNotification.email}</p>
                  <p><strong>Agence:</strong> {selectedTicketForNotification.agence}</p>
                  <p><strong>Service:</strong> {selectedTicketForNotification.service}</p>
                  <p><strong>Statut:</strong> <span className={`status-badge ${selectedTicketForNotification.status}`}>
                    {getStatusLabel(selectedTicketForNotification.status)}
                  </span></p>
                </div>
              </div>
              
              <div className="message-section">
                <label htmlFor="notification-message">
                  <strong>Message personnalisé (optionnel):</strong>
                </label>
                <textarea
                  id="notification-message"
                  className="notification-textarea"
                  placeholder="Laissez vide pour utiliser le message par défaut, ou écrivez votre message personnalisé..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows="4"
                  maxLength="500"
                />
                <small className="char-count">
                  {notificationMessage.length}/500 caractères
                </small>
              </div>
              
              <div className="preview-section">
                <p><strong>Aperçu du message:</strong></p>
                <div className="message-preview">
                  {notificationMessage.trim() || "L'administrateur souhaite vous informer concernant votre ticket."}
                </div>
              </div>
            </div>
            
            <div className="notification-modal-footer">
              <button 
                className="modal-btn cancel" 
                onClick={closeNotificationModal}
              >
                Annuler
              </button>
              <button 
                className="modal-btn send" 
                onClick={sendCustomNotification}
              >
                📧 Envoyer la notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
