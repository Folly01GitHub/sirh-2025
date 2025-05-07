
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
    
    // Add logging for evaluator responses requests
    if (config.url === '/evaluator_responses') {
      console.log('Fetching evaluator responses with params:', config.params);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Add logging for evaluator responses
    if (response.config.url === '/evaluator_responses') {
      console.log('Evaluator responses data received:', response.data);
    }
    
    // Add detailed logging for evaluator responses
    if (response.config.url === '/evaluator_responses' && response.data) {
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`Found ${response.data.length} evaluator response(s):`, 
          response.data.map(r => `Item ID: ${r.item_id}, Value: ${r.value}`));
      } else {
        console.log('No evaluator responses found or empty array returned');
      }
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      
      // Specific handling for draft saving errors
      if (
        (error.config.url === '/auto_draft' || 
         error.config.url === '/brouillon_eval' || 
         error.config.url.includes('/evaluator_responses')) && 
        error.response.status === 400
      ) {
        console.warn('Draft save or fetch error:', error.response.data);
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
