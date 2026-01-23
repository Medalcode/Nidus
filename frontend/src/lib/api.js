import axios from 'axios';

const api = axios.create({
  baseURL: '/', // Relative path since we proxy or simple path
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and maybe redirect (handled by AuthContext state usually)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // We can rely on App.jsx state to detect this, or dispatch event
      window.location.reload(); 
    }
    return Promise.reject(error);
  }
);

export default api;
