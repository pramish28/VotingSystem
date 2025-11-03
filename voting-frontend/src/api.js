import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Existing
export async function createElection(formData) {
  return api.post('/api/election/create', formData, { timeout: 30000 });
}

// Needed for dropdown
export async function listAllElections() {
  const { data } = await api.get('/api/election');
  return data || [];
}

// PDF single
export async function downloadResultsPdf(electionId) {
  const params = {};
  if (electionId) params.electionId = electionId;
  return api.get('/api/vote/results/export.pdf', { params, responseType: 'blob' });
}

// PDF share (auto post)
export async function shareResultsSummaryPdf(electionId, note) {
  const { data } = await api.post('/api/vote/results/share-summary-pdf', { electionId, note });
  return data;
}

// PDF all (returns URLs for each election)
export async function exportAllElectionsPdf() {
  const { data } = await api.get('/api/vote/results/export-all.pdf');
  return data?.files || [];
}

export default api;
