import axios from 'axios';

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
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
  (response) => {
    // Log successful responses for debugging purposes
    console.log(`API Success: ${response.config.url}`, response.data);
    
    // Handle null responses safely for evaluator_responses
    if (response.config.url?.includes('/evaluator_responses')) {
      if (!response.data || !response.data.responses) {
        console.warn('Evaluator responses is null or empty, providing default structure');
        response.data = response.data || {};
        response.data.responses = response.data.responses || [];
      }
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('Error Status:', error.response.status);
      console.error('Error Headers:', error.response.headers);
      
      // Specific handling for null responses in evaluations
      if (
        (error.config.url === '/auto_draft' || 
         error.config.url === '/brouillon_eval' || 
         error.config.url?.includes('/evaluator_responses') ||
         error.config.url?.includes('/collab_responses'))
      ) {
        if (error.response.status === 400 || error.response.status === 404) {
          console.warn('Evaluation responses error handled gracefully:', error.response.data);
          
          // Return a default empty structure instead of rejecting
          if (error.config.url?.includes('/evaluator_responses')) {
            return Promise.resolve({
              data: {
                responses: []
              }
            });
          }
        }
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
