// API Configuration
// Update this URL with your actual backend URL when deployed

export const API_CONFIG = {
  // Production backend URL
  BASE_URL: 'https://hakikisha-backend.onrender.com/api/v1',
  
  TIMEOUT: 30000, // 30 seconds
};

// Environment-specific URLs
export const getApiUrl = () => {
  // You can add logic here to switch between dev/staging/prod
  return API_CONFIG.BASE_URL;
};
