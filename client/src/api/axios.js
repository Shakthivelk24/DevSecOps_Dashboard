// client/src/api/axios.js
// Configured Axios instance with base URL, interceptors, and
// automatic token refresh / error handling.

import axios from 'axios';
import { fetchClerkToken } from './clerkToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────
// Runs before every request — can add auth headers here if needed
api.interceptors.request.use(
  async (config) => {
    const clerkToken = await fetchClerkToken();

    if (clerkToken) {
      config.headers.Authorization = `Bearer ${clerkToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────
// Runs on every response — handles global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired or invalid — redirect to sign-in
      // Don't redirect if already on the sign-in page
      if (!window.location.pathname.includes('/sign-in')) {
        window.location.href = '/sign-in';
      }
    }

    if (status === 403) {
      console.warn('Access forbidden');
    }

    if (status >= 500) {
      console.error('Server error:', error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

export default api;