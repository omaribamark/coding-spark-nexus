// API Configuration

export const API_CONFIG = {
  // Production backend URL
  BASE_URL: 'https://hakikisha-backend-0r1w.onrender.com',
  
  TIMEOUT: 30000, // 30 seconds
};

// Environment-specific URLs
export const getApiUrl = () => {
  
  return API_CONFIG.BASE_URL;
};
