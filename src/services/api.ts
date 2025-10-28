import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your Render backend URL
const BASE_URL = 'https://hakikisha-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Hakikisha-Mobile-App/1.0.0'
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    
    // Get token from AsyncStorage and add to headers
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response received: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access - redirect to login');
    }
    
    // Return a more user-friendly error message
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your internet connection.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    }
    
    return Promise.reject(error);
  }
);

export default api;