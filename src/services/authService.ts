import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      full_name: string;
      role: string;
    };
    token: string;
    refresh_token: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse['data']> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens and user data
    await AsyncStorage.setItem('authToken', response.data.data.token);
    await AsyncStorage.setItem('refreshToken', response.data.data.refresh_token);
    await AsyncStorage.setItem('isAuthenticated', 'true');
    await AsyncStorage.setItem('userEmail', response.data.data.user.email);
    await AsyncStorage.setItem('userRole', response.data.data.user.role);
    await AsyncStorage.setItem('userName', response.data.data.user.full_name);
    
    return response.data.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse['data']> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    // Store tokens and user data
    await AsyncStorage.setItem('authToken', response.data.data.token);
    await AsyncStorage.setItem('refreshToken', response.data.data.refresh_token);
    await AsyncStorage.setItem('isAuthenticated', 'true');
    await AsyncStorage.setItem('userEmail', response.data.data.user.email);
    await AsyncStorage.setItem('userRole', response.data.data.user.role);
    await AsyncStorage.setItem('userName', response.data.data.user.full_name);
    
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    // Clear all stored data
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('isAuthenticated');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userName');
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },

  getStoredAuthData: async (): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const role = await AsyncStorage.getItem('userRole');
    const email = await AsyncStorage.getItem('userEmail');
    const name = await AsyncStorage.getItem('userName');
    
    if (token && role) {
      return {
        token,
        user: { role, email, full_name: name }
      };
    }
    return null;
  },
};
