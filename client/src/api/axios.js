import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stored CSRF token in memory
let currentCsrfToken = null;

export const setStoredCsrfToken = (token) => {
  currentCsrfToken = token;
};

export const getStoredCsrfToken = () => {
  if (currentCsrfToken) return currentCsrfToken;
  // Fallback to cookie check if available in document.cookie
  const match = document.cookie.match(/(?:^|;\s*)campusgig_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

// Request interceptor to attach CSRF token to state-changing requests
api.interceptors.request.use(
  (config) => {
    const token = getStoredCsrfToken();
    if (token && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      config.headers['x-csrf-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to update CSRF token if returned and standardize errors
api.interceptors.response.use(
  (response) => {
    // If response returned a new csrfToken, update store
    if (response.data?.data?.csrfToken) {
      setStoredCsrfToken(response.data.data.csrfToken);
    }
    return response;
  },
  (error) => {
    const formattedError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred. Please check your connection.',
      errors: error.response?.data?.errors || [],
    };
    return Promise.reject(formattedError);
  }
);

export default api;
