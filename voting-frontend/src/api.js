import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  // If your backend uses header-based JWT (not cookies), keep withCredentials: false
  withCredentials: false,
});

// Always attach the latest token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // <-- make sure your login stores to "token"
  if (token) {
    config.headers = config.headers || {};
    // don't clobber if already explicitly set
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Centralized 401 handling (optional but helpful)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // session expired / wrong role / missing token
      console.warn('401 Unauthorized — clearing token and redirecting to login');
      localStorage.removeItem('token');
      // optional: show a toast here
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Export helpers that ALWAYS use this instance
export async function createElection(formData) {
  // Don't set 'Content-Type' yourself — axios will set the correct boundary for FormData
  return api.post('/api/election/create', formData);
}

export default api;


