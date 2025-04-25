import axios from 'axios';

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

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error during request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
