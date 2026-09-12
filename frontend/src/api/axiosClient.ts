import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Resolves and normalizes the API base URL.
 * Ensures the base URL always points to /api without duplicate slashes,
 * missing /api suffix, or accidental localhost in production.
 */
const resolveBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isProd = import.meta.env.MODE === 'production' || import.meta.env.PROD;
  const fallback = isProd
    ? 'https://rajsaurbhtools-hub-backend.onrender.com/api'
    : 'http://localhost:5000/api';

  const rawUrl = (typeof envUrl === 'string' && envUrl.trim()) ? envUrl.trim() : fallback;
  const cleanUrl = rawUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const baseURL = resolveBaseUrl();

export const axiosClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout to accommodate Render cold start spin-ups
});

// Request Interceptor: Attach JWT Bearer Token if available
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem('rajsaurbh_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error retrieving auth token in request interceptor', e);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardized Error Handling
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('rajsaurbh_auth_token');
        localStorage.removeItem('rajsaurbh_auth_user');
      } catch {
        // ignore
      }
    }
    // If backend returns a structured ApiError response
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject({
        message: 'The server took longer than expected to respond. If the backend is waking up, please retry in a few seconds.',
      });
    }
    return Promise.reject({
      message: error.message || 'Network connection error. Please check your internet connection and try again.',
    });
  }
);

