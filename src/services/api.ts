import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your Render backend URL
const BASE_URL = 'https://hakikisha-backend-0r1w.onrender.com/api/v1';

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
    console.log(`🔄 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    
    try {
      // Get token from AsyncStorage and add to headers
      // FIXED: Using the correct key 'authToken' instead of 'auth_token'
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token attached to request');
      } else {
        console.log('⚠️ No token found in storage');
        console.log('🔍 Available storage keys:', await AsyncStorage.getAllKeys());
      }
    } catch (error) {
      console.error('❌ Error getting token from storage:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received: ${response.status}`);
    return response;
  },
  async (error) => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    };
    
    console.error('❌ API Error:', errorDetails);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized access - redirect to login');
      
      // Clear stored auth data on unauthorized access
      try {
        await AsyncStorage.multiRemove([
          'authToken',
          'refreshToken',
          'isAuthenticated',
          'userEmail',
          'userRole',
          'userName',
          'userId'
        ]);
        console.log('🧹 Cleared authentication data');
      } catch (storageError) {
        console.error('❌ Error clearing auth data:', storageError);
      }
    }
    
    // Handle token expiration
    if (error.response?.status === 403) {
      console.log('🔄 Token expired, attempting refresh...');
      // You can add refresh token logic here if needed
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

// Helper function to manually check and attach token
export const attachTokenManually = async (config: any = {}) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
      console.log('🔧 Manually attached token to request');
    }
    return config;
  } catch (error) {
    console.error('❌ Error manually attaching token:', error);
    return config;
  }
};

// Helper function to debug token storage
export const debugTokenStorage = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const allKeys = await AsyncStorage.getAllKeys();
    
    console.log('🔍 Token Debug Info:', {
      hasToken: !!token,
      tokenLength: token?.length,
      allStorageKeys: allKeys
    });
    
    return {
      hasToken: !!token,
      tokenLength: token?.length,
      allStorageKeys: allKeys
    };
  } catch (error) {
    console.error('❌ Error debugging token storage:', error);
    return null;
  }
};

export default api;