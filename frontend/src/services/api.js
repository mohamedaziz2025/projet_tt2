import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configuration Axios simple
const apiClient = axios.create({
  baseURL: API_URL,
});

// Services d'authentification simplifiés (sans JWT)
export const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    // Stocker les données admin sans token
    if (response.data.admin) {
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('adminUser');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminUser');
  }
};

// Services des tickets
export const ticketService = {
  create: (ticketData) => apiClient.post('/tickets', ticketData),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  getAll: () => apiClient.get('/tickets')
};

// Fonctions d'export pour compatibilité
export const createTicket = ticketService.create;
export const loginAdmin = authService.login;

// Services du dashboard
export const dashboardService = {
  getQueue: () => apiClient.get('/dashboard/queue'),
  getStats: () => apiClient.get('/dashboard/stats'),
  updateTicketStatus: (id, status) => 
    apiClient.put(`/dashboard/tickets/${id}/status`, { status }),
  callNextTicket: () => apiClient.post('/dashboard/call-next'),
  exportCSV: (startDate, endDate) => 
    apiClient.get('/dashboard/export', {
      params: { startDate, endDate },
      responseType: 'blob'
    }),
  // Notification manuelle
  sendNotification: (ticketId, message = null) => 
    apiClient.post(`/dashboard/notify/${ticketId}`, { message }),
  // Notification d'approche
  sendApproachNotification: (ticketId) => 
    apiClient.post(`/dashboard/notify-approach/${ticketId}`),
  // Notification forcée (alias pour compatibilité)
  forceNotification: (ticketId) => 
    apiClient.post(`/dashboard/notify/${ticketId}`, { 
      message: "Votre tour approche, veuillez vous présenter à l'agence." 
    })
};

// Services pour gérer les agences
export const agenceService = {
  getAll: () => apiClient.get('/agences'),
  getById: (id) => apiClient.get(`/agences/${id}`),
  create: (agenceData) => apiClient.post('/agences', agenceData),
  update: (id, agenceData) => apiClient.put(`/agences/${id}`, agenceData),
  delete: (id) => apiClient.delete(`/agences/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/agences/${id}/status`, { statut: status })
};

// Services pour gérer les services
export const serviceService = {
  getAll: () => apiClient.get('/services'),
  getById: (id) => apiClient.get(`/services/${id}`),
  create: (serviceData) => apiClient.post('/services', serviceData),
  update: (id, serviceData) => apiClient.put(`/services/${id}`, serviceData),
  delete: (id) => apiClient.delete(`/services/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/services/${id}/status`, { statut: status })
};

export default apiClient;
