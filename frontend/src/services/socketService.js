import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connecté à Socket.IO');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Déconnecté de Socket.IO');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion Socket.IO:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Rejoindre la room admin
  joinAdminRoom() {
    if (this.socket) {
      this.socket.emit('join-admin');
    }
  }

  // Quitter la room admin
  leaveAdminRoom() {
    if (this.socket) {
      this.socket.emit('leave-admin');
    }
  }

  // Écouter les événements spécifiques
  onTicketUpdated(callback) {
    if (this.socket) {
      this.socket.on('ticket-updated', callback);
    }
  }

  onTicketCalled(callback) {
    if (this.socket) {
      this.socket.on('ticket-called', callback);
    }
  }

  onNotificationSent(callback) {
    if (this.socket) {
      this.socket.on('notification-sent', callback);
    }
  }

  // Supprimer les écouteurs
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Obtenir le statut de connexion
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Instance singleton
const socketService = new SocketService();

export default socketService;
