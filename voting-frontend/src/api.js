// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000',
//   withCredentials: true,
//   timeout: 10000, // 10 seconds timeout
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => Promise.reject(error)
// );

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Revert to original baseURL to avoid breaking login
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Explicit endpoint for election creation
export const createElection = async (formData) => {
  try {
    const response = await api.post('/api/election/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add login function (assuming endpoint is /api/auth)
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth', credentials);
    const { token } = response.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;