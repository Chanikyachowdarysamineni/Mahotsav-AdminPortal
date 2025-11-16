import axios from 'axios';

// Build a robust API base URL that works on LAN/dev/prod
function resolveApiBaseUrl() {
  // 1) Highest priority: explicit env var
  const envUrl = import.meta?.env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  // 2) If running in a browser, reuse current host/IP with port 5000
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    // When accessed from phone or another PC, hostname will be the LAN IP
    return `${protocol}//${hostname}:5000/api`;
  }

  // 3) Sensible default for Node/test contexts
  return 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout to better tolerate slower networks/devices
  timeout: 20000,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with an error status code
      const { status, data } = error.response;
      const msg = (data && (data.message || data.error)) || 'Unknown error';
      console.error('API Error:', status, msg, data);
      
      // If 401 Unauthorized and NOT on login page, clear token (but don't auto-redirect)
      if (status === 401 && window.location.pathname !== '/login') {
        console.log('Unauthorized - clearing invalid token');
        localStorage.removeItem('token');
        // Let React Router handle the redirect via ProtectedRoute
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Something happened while setting up the request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Participants API
export const participantsAPI = {
  getAll: () => api.get('/participants'),
  getById: (id) => api.get(`/participants/${id}`),
  create: (data) => api.post('/participants', data),
  update: (id, data) => api.put(`/participants/${id}`, data),
  delete: (id) => api.delete(`/participants/${id}`),
  getByEvent: (eventId) => api.get(`/participants/event/${eventId}`),
  getByCollege: (college) => api.get(`/participants/college/${college}`),
};

// Registrations API
export const registrationsAPI = {
  getAll: () => api.get('/registrations'),
  getById: (id) => api.get(`/registrations/${id}`),
  create: (data) => api.post('/registrations', data),
  update: (id, data) => api.put(`/registrations/${id}`, data),
  delete: (id) => api.delete(`/registrations/${id}`),
  getByPaymentStatus: (status) => api.get(`/registrations/payment-status/${status}`),
};

// Teams API
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  getByEvent: (eventId) => api.get(`/teams/event/${eventId}`),
  getByCollege: (college) => api.get(`/teams/college/${college}`),
};

// Events API
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Colleges API (Public endpoint)
export const collegesAPI = {
  getAll: () => api.get('/colleges'),
  getById: (id) => api.get(`/colleges/${id}`),
  create: (data) => api.post('/colleges', data),
  update: (id, data) => api.put(`/colleges/${id}`, data),
  delete: (id) => api.delete(`/colleges/${id}`),
};

// Coordinators API
export const coordinatorsAPI = {
  getAll: () => api.get('/coordinators'),
  getById: (id) => api.get(`/coordinators/${id}`),
  create: (data) => api.post('/coordinators', data),
  update: (id, data) => api.put(`/coordinators/${id}`, data),
  delete: (id) => api.delete(`/coordinators/${id}`),
  getByCollege: (collegeId) => api.get(`/coordinators/college/${collegeId}`),
  getByEvent: (eventId) => api.get(`/coordinators/event/${eventId}`),
  // Tracking endpoints
  recordLogin: (id) => api.post(`/coordinators/${id}/login`),
  recordLogout: (id) => api.post(`/coordinators/${id}/logout`),
  recordCollection: (id, amount) => api.post(`/coordinators/${id}/collection`, { amount }),
  getStats: (id) => api.get(`/coordinators/${id}/stats`),
  cleanupInactive: () => api.post('/coordinators/cleanup-inactive'),
};

// Dashboard API (NEW - Optimized)
export const dashboardAPI = {
  getStatistics: () => api.get('/dashboard/statistics'),
  getQuickStats: () => api.get('/dashboard/quick-stats'),
  getEventStats: () => api.get('/dashboard/event-stats'),
};

// Reports API
export const reportsAPI = {
  getStatistics: () => api.get('/reports/statistics'),
  getParticipantsByEvent: () => api.get('/reports/participants-by-event'),
  getPaymentSummary: () => api.get('/reports/payment-summary'),
  getAdminMetrics: () => api.get('/reports/admin-metrics'),
  // Paginated registrations with filters
  getRegistrations: (params) => api.get('/reports/registrations', { params }),
  getCollegeParticipants: (params) => api.get('/reports/college-participants', { params }),
  // Added for modules and summaries
  getTeams: (params) => api.get('/reports/teams', { params }),
  getIndividuals: (params) => api.get('/reports/individuals', { params }),
  getCollegesSummary: (params) => api.get('/reports/colleges-summary', { params }),
  getGenderList: (params) => api.get('/reports/gender-list', { params }),
  getEventsOverview: () => api.get('/reports/events-overview'),
};

// Leads API
export const leadsAPI = {
  getAll: () => api.get('/leads'),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  getByRole: (role) => api.get(`/leads/role/${role}`),
  search: (searchTerm) => api.post('/leads/search', { searchTerm }),
};

// Event Registrations API
export const eventRegistrationsAPI = {
  getAll: () => api.get('/event-registrations'),
  getById: (id) => api.get(`/event-registrations/${id}`),
  create: (data) => api.post('/event-registrations', data),
  update: (id, data) => api.put(`/event-registrations/${id}`, data),
  delete: (id) => api.delete(`/event-registrations/${id}`),
  getByEvent: (eventName) => api.get(`/event-registrations/event/${eventName}`),
  getByCollege: (college) => api.get(`/event-registrations/college/${college}`),
  getByStatus: (status) => api.get(`/event-registrations/status/${status}`),
  getStats: () => api.get('/event-registrations/stats/summary'),
};

export default api;
