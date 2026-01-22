import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  identifier?: string;
  email?: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  username?: string;
  is_verified?: boolean;
  registration_status?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

interface LoginResponse {
  success?: boolean;
  requires2FA?: boolean;
  userId?: string;
  email?: string;
  role?: string;
  message?: string;
  user?: User;
  token?: string;
  refresh_token?: string;
}

interface RegisterResponse {
  success: boolean;
  requiresEmailVerification?: boolean;
  userId?: string;
  email?: string;
  message?: string;
  user?: User;
  token?: string;
  refresh_token?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const trimmedCredentials: any = {
      password: credentials.password.trim(),
    };
    
    if (credentials.identifier) {
      trimmedCredentials.identifier = credentials.identifier.trim();
    } else if (credentials.email) {
      trimmedCredentials.email = credentials.email.trim();
    }
    
    console.log('Making login request with:', {
      identifier: trimmedCredentials.identifier,
      hasPassword: !!trimmedCredentials.password
    });
    
    const response = await api.post<any>('/auth/login', trimmedCredentials);
    const authData = response.data;

    console.log('📋 Backend raw response:', JSON.stringify(authData, null, 2));

    //  CRITICAL FIX: Enhanced 2FA response detection with better error handling
    if (authData?.requires2FA === true && !authData?.token) {
      console.log('🔐 2FA required - processing 2FA response');
      
      // FIX: Extract data from multiple possible locations with fallbacks
      const twoFAResponse: LoginResponse = {
        success: authData.success,
        requires2FA: true,
        // Try multiple possible field names for each property
        userId: authData.userId || authData.user?.id || authData.user_id,
        email: authData.email || authData.user?.email || authData.userEmail,
        role: authData.role || authData.user?.role,
        message: authData?.message,
        user: authData.user || {
          id: authData.userId || authData.user?.id,
          email: authData.email || authData.user?.email,
          role: authData.role || authData.user?.role
        }
      };
      
      console.log('🔐 Processed 2FA response:', twoFAResponse);
      
      //  VALIDATION: Check if we have the required data
      if (!twoFAResponse.userId || !twoFAResponse.email) {
        console.error('❌ 2FA response missing required data:', twoFAResponse);
        
        // Try to get email from the original identifier if available
        if (credentials.identifier && credentials.identifier.includes('@')) {
          twoFAResponse.email = credentials.identifier.trim().toLowerCase();
          console.log('🔄 Using identifier as email fallback:', twoFAResponse.email);
        }
        
        // If still missing, throw error
        if (!twoFAResponse.userId || !twoFAResponse.email) {
          throw new Error('Authentication data incomplete from server. Missing userId or email.');
        }
      }
      
      return twoFAResponse;
    }

    // If backend sent a token (test users or non-2FA users)
    if (authData?.token) {
      console.log('✅ Token received from backend - storing auth data');
      
      // Store tokens and user data
      if (authData.token) {
        await AsyncStorage.setItem('authToken', authData.token);
      }
      
      if (authData.refresh_token || authData.refreshToken) {
        await AsyncStorage.setItem('refreshToken', authData.refresh_token || authData.refreshToken);
      } else {
        await AsyncStorage.removeItem('refreshToken');
      }
      
      if (authData.user) {
        await AsyncStorage.setItem('isAuthenticated', 'true');
        await AsyncStorage.setItem('userEmail', authData.user.email || '');
        await AsyncStorage.setItem('userRole', authData.user.role || '');
        await AsyncStorage.setItem('userName', authData.user.username || authData.user.full_name || '');
        await AsyncStorage.setItem('userId', authData.user.id || '');
      }

      return authData;
    }

    // Store tokens and user data for regular users (non-2FA)
    if (authData.token) {
      await AsyncStorage.setItem('authToken', authData.token);
    } else {
      console.warn('No auth token received in login response');
    }
    
    if (authData.refresh_token) {
      await AsyncStorage.setItem('refreshToken', authData.refresh_token);
    } else {
      console.warn('No refresh token received in login response');
      await AsyncStorage.removeItem('refreshToken');
    }
    
    if (authData.user) {
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('userEmail', authData.user.email || '');
      await AsyncStorage.setItem('userRole', authData.user.role || '');
      await AsyncStorage.setItem('userName', authData.user.username || authData.user.full_name || '');
      await AsyncStorage.setItem('userId', authData.user.id || '');
    } else {
      console.warn('No user data received in login response');
    }

    return authData;
  },

  verify2FA: async (userId: string, code: string): Promise<{ user: User; token: string; refresh_token: string }> => {
    console.log('🔐 Verifying 2FA code for user:', userId);
    
    const response = await api.post<AuthResponse>('/auth/verify-2fa', {
      userId,
      code
    });
    
    const authData = response.data;
    
    console.log('✅ 2FA verification response:', authData);
    
    // Store tokens
    if (authData.token) {
      await AsyncStorage.setItem('authToken', authData.token);
    } else {
      console.warn('No auth token received in 2FA verification response');
    }
    
    if (authData.refresh_token) {
      await AsyncStorage.setItem('refreshToken', authData.refresh_token);
    } else {
      console.warn('No refresh token received in 2FA verification response');
      await AsyncStorage.removeItem('refreshToken');
    }
    
    if (authData.user) {
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('userEmail', authData.user.email || '');
      await AsyncStorage.setItem('userRole', authData.user.role || '');
      await AsyncStorage.setItem('userName', authData.user.username || authData.user.full_name || '');
      await AsyncStorage.setItem('userId', authData.user.id || '');
    }
    
    return authData;
  },

  resend2FA: async (userId: string, email: string): Promise<void> => {
    console.log('🔄 Resending 2FA code to:', email);
    await api.post('/auth/resend-2fa', { userId, email });
  },

  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const trimmedUserData = {
      email: userData.email.trim(),
      password: userData.password.trim(),
      username: userData.full_name.trim().toLowerCase().replace(/\s+/g, '_'),
      phone: userData.phone_number.trim(),
    };
    
    console.log('Sending registration data:', trimmedUserData);
    
    const response = await api.post<any>('/auth/register', trimmedUserData);
    
    console.log('Registration response:', response.data);
    
    // Store userId for email verification
    if (response.data.user && response.data.user.id) {
      await AsyncStorage.setItem('userId', response.data.user.id);
      await AsyncStorage.setItem('userEmail', response.data.user.email);
      console.log('Stored userId:', response.data.user.id);
    } else {
      console.error('No user ID found in registration response:', response.data);
    }
    
    // Check if email verification is required
    if (response.data.requiresEmailVerification) {
      return {
        success: true,
        requiresEmailVerification: true,
        userId: response.data.user.id,
        email: response.data.user.email,
        message: response.data.message
      };
    }
    
    const authData = response.data;
    
    if (authData.token) {
      await AsyncStorage.setItem('authToken', authData.token);
    }
    
    if (authData.refresh_token) {
      await AsyncStorage.setItem('refreshToken', authData.refresh_token);
    } else {
      await AsyncStorage.removeItem('refreshToken');
    }
    
    if (authData.user) {
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('userEmail', authData.user.email || '');
      await AsyncStorage.setItem('userRole', authData.user.role || '');
      await AsyncStorage.setItem('userName', authData.user.username || '');
      await AsyncStorage.setItem('userId', authData.user.id || '');
    }
    
    return authData;
  },

  verifyEmail: async (userId: string, code: string): Promise<void> => {
    console.log('Verifying email with:', { userId, code });
    
    if (!userId || !code) {
      throw new Error('User ID and verification code are required');
    }
    
    try {
      const response = await api.post('/auth/verify-email', { 
        userId: userId.trim(), 
        code: code.trim() 
      });
      console.log('Email verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Email verification error:', error.response?.data || error.message);
      throw error;
    }
  },

  resendVerification: async (email: string): Promise<{ userId?: string }> => {
    console.log('Resending verification to:', email);
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    try {
      const response = await api.post('/auth/resend-verification', { 
        email: email.trim().toLowerCase() 
      });
      console.log('Resend verification response:', response.data);
      
      if (response.data.userId) {
        await AsyncStorage.setItem('userId', response.data.userId);
        console.log('Stored userId from resend:', response.data.userId);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Resend verification error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await AsyncStorage.multiRemove([
        'authToken',
        'refreshToken',
        'isAuthenticated',
        'userEmail',
        'userRole',
        'userName',
        'userId'
      ]);
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    const response = await api.post('/auth/forgot-password', { 
      email: email.trim().toLowerCase() 
    });
    console.log('Forgot password response:', response.data);
    return response.data;
  },

  resetPassword: async (email: string, resetCode: string, newPassword: string): Promise<void> => {
    console.log('Reset password called with:', { 
      email: email.trim().toLowerCase(), 
      resetCode: resetCode.trim(), 
      newPassword: '***' 
    });
    
    const resetData = {
      email: email.trim().toLowerCase(),
      token: resetCode.trim(),
      newPassword: newPassword.trim()
    };
    
    console.log('Sending reset password data:', { ...resetData, newPassword: '***' });
    
    const response = await api.post('/auth/reset-password', resetData);
    console.log('Reset password response:', response.data);
    return response.data;
  },

  resetPasswordWithToken: async (email: string, token: string, newPassword: string): Promise<void> => {
    console.log('Reset password with token called with:', { 
      email: email.trim().toLowerCase(), 
      token: token.trim(), 
      newPassword: '***' 
    });
    
    const resetData = {
      email: email.trim().toLowerCase(),
      token: token.trim(),
      newPassword: newPassword.trim()
    };
    
    const response = await api.post('/auth/reset-password', resetData);
    console.log('Reset password with token response:', response.data);
    return response.data;
  },

  getStoredAuthData: async (): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const role = await AsyncStorage.getItem('userRole');
    const email = await AsyncStorage.getItem('userEmail');
    const name = await AsyncStorage.getItem('userName');
    const userId = await AsyncStorage.getItem('userId');
    
    console.log('Retrieved stored data:', { token, role, email, name, userId });
    
    if (token && role) {
      return {
        token,
        user: { 
          id: userId,
          role, 
          email, 
          full_name: name 
        }
      };
    }
    return null;
  },

  getStoredUserId: async (): Promise<string | null> => {
    const userId = await AsyncStorage.getItem('userId');
    console.log('Retrieved stored userId:', userId);
    return userId;
  },

  getStoredUserEmail: async (): Promise<string | null> => {
    const email = await AsyncStorage.getItem('userEmail');
    console.log('Retrieved stored userEmail:', email);
    return email;
  },

  storeUserId: async (userId: string): Promise<void> => {
    await AsyncStorage.setItem('userId', userId);
    console.log('Explicitly stored userId:', userId);
  },

  clearStoredUserId: async (): Promise<void> => {
    await AsyncStorage.removeItem('userId');
    console.log('Cleared stored userId');
  },

  safeSetItem: async (key: string, value: any): Promise<void> => {
    if (value === undefined || value === null) {
      console.warn(`Attempted to store undefined/null value for key: ${key}`);
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, value.toString());
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('authToken');
    const isAuth = await AsyncStorage.getItem('isAuthenticated');
    return !!(token && isAuth === 'true');
  },

  getAuthToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('authToken');
  },

  refreshToken: async (): Promise<{ token: string; refreshToken: string }> => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post('/auth/refresh-token', {
      refreshToken
    });
    
    const { token, refreshToken: newRefreshToken } = response.data;
    
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    }
    if (newRefreshToken) {
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return { token, refreshToken: newRefreshToken };
  }
};