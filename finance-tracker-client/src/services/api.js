import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // required so the httpOnly refresh cookie is sent/received
});

// Attach the in-memory access token to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, try refreshing the access token once, then retry the original request.
// Guards against infinite loops if the refresh call itself fails or 401s.
let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !original._retry && !isRefreshCall) {
      original._retry = true;

      try {
        // Multiple simultaneous 401s should share a single in-flight refresh call
        refreshPromise = refreshPromise || api.post('/auth/refresh');
        const res = await refreshPromise;
        refreshPromise = null;

        setAccessToken(res.data.accessToken);
        original.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        refreshPromise = null;
        clearAccessToken();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// ---- Auth ----
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');
export const refreshAccessToken = () => api.post('/auth/refresh');
export const getCurrentUser = () => api.get('/auth/me');
export const githubLoginUrl = `${API_URL}/auth/github`;
export const verifyEmail = (token) => api.get(`/auth/verify-email?token=${token}`);
export const resendVerification = (email) => api.post('/auth/resend-verification', { email });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// ---- Dashboard ----
export const getDashboard = () => api.get('/dashboard');
export const getPublicTransactions = () => api.get('/public-transactions');

// ---- Transactions ----
export const getTransactions = () => api.get('/transactions');
export const getTransaction = (id) => api.get(`/transactions/${id}`);
export const addTransaction = (data) => api.post('/transactions', data);
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

export default api;