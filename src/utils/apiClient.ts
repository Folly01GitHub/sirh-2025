
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
    
    // Log API requests for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || {});
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for specific endpoints
    if (response.config.url?.includes('/evaluator_responses') || 
        response.config.url?.includes('/collab_responses')) {
      console.log(`API Response for ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
      
      // Only log headers and config for serious errors
      if (error.response.status >= 500) {
        console.error('API Error Headers:', error.response.headers);
        console.error('API Error Config:', error.config);
      }
      
      // Specific handling for form data errors
      if (
        (error.config.url === '/auto_draft' || 
         error.config.url === '/brouillon_eval' || 
         error.config.url?.includes('/evaluator_responses') ||
         error.config.url?.includes('/collab_responses')) && 
        error.response.status === 400
      ) {
        console.warn('Data save or fetch error:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error during request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
