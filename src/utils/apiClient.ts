import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://backend.local.com/api'
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (AuthContext keeps it there)
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
