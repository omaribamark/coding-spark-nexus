import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async login(credentials) {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Login response:', response.data);

      if (response.data.success) {
        // If 2FA is required, return the temporary data without storing
        if (response.data.requires2FA) {
          return response.data;
        }
        
        // Store token and user data for regular login
        await this.storeAuthData(response.data);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  async verify2FA(verificationData) {
    try {
      console.log('Verifying 2FA OTP...');
      
      const response = await api.post('/auth/verify-2fa', verificationData);
      
      console.log('2FA verification response:', response.data);

      if (response.data.success) {
        // Store the final token and user data
        await this.storeAuthData(response.data);
        return response.data;
      } else {
        throw new Error(response.data.error || '2FA verification failed');
      }
    } catch (error) {
      console.error('2FA verification error:', error.response?.data || error.message);
      throw error;
    }
  }

  async resend2FA(resendData) {
    try {
      console.log('Resending 2FA OTP...');
      
      const response = await api.post('/auth/resend-2fa', resendData);
      
      console.log('Resend OTP response:', response.data);

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        // Store token and user data if auto-login is enabled
        if (response.data.token) {
          await this.storeAuthData(response.data);
        }
        return response.data;
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async storeAuthData(authData) {
    try {
      // Store token in AsyncStorage
      await AsyncStorage.setItem('auth_token', authData.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(authData.user));
      
      // Set default authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
      
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  async getStoredAuthData() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        // Set authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return {
          token,
          user: JSON.parse(userData)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting stored auth data:', error);
      return null;
    }
  }

  async logout() {
    try {
      // Remove stored data
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      
      // Remove authorization header
      delete api.defaults.headers.common['Authorization'];
      
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async verifyToken() {
    try {
      const authData = await this.getStoredAuthData();
      if (!authData) {
        return null;
      }

      const response = await api.post('/auth/verify-token', {
        token: authData.token
      });

      if (response.data.success) {
        return response.data.user;
      } else {
        await this.logout();
        return null;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      await this.logout();
      return null;
    }
  }

  async isAuthenticated() {
    const authData = await this.getStoredAuthData();
    return authData !== null;
  }

  async getUserRole() {
    const authData = await this.getStoredAuthData();
    return authData?.user?.role || null;
  }

  // 2FA Management Methods
  async enable2FA(userId?: string) {
    try {
      const response = await api.post('/auth/enable-2fa', { userId });
      return response.data;
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw error;
    }
  }

  async disable2FA(userId?: string) {
    try {
      const response = await api.post('/auth/disable-2fa', { userId });
      return response.data;
    } catch (error) {
      console.error('Disable 2FA error:', error);
      throw error;
    }
  }

  async get2FAStatus(userId?: string) {
    try {
      const response = await api.get('/auth/2fa-status', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Get 2FA status error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;