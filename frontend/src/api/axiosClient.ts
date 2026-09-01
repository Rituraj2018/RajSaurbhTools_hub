import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const axiosClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // You can attach auth tokens here in future steps
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Standard error formatting
    return Promise.reject(error.response?.data || error.message);
  }
);
