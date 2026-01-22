import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState, useEffect} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {CustomButton} from '../components';
import LineInputField from '../components/LineInputField';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== GOOGLE PLAY STORE 2FA BYPASS - START ====================
// Test users that bypass 2FA completely - no OTP sent, direct login
const TEST_USERS = [
  'admin.bypass@hakikisha.com',
  'factchecker.bypass@hakikisha.com', 
  'user.normal@hakikisha.com'
];
// ==================== GOOGLE PLAY STORE 2FA BYPASS - END ====================

// Storage keys
const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'user_data';

// Enhanced token storage utility
const AuthStorage = {
  setAuthData: async (token: string, refreshToken: string, user: any) => {
    try {
      console.log('💾 Storing auth data...', {
        token: token ? 'Yes' : 'No',
        refreshToken: refreshToken ? 'Yes' : 'No',
        user: user ? user.role : 'No'
      });
      
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [REFRESH_TOKEN_KEY, refreshToken || ''],
        [USER_DATA_KEY, JSON.stringify(user)]
      ]);
      console.log('✅ Auth data stored successfully');
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      throw error;
    }
  },

  getAuthToken: async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      console.log('🔑 Retrieved auth token:', token ? 'Yes' : 'No');
      return token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      console.log('🔄 Retrieved refresh token:', refreshToken ? 'Yes' : 'No');
      return refreshToken;
    } catch (error) {
      console.error('❌ Error getting refresh token:', error);
      return null;
    }
  },

  getUserData: async (): Promise<any> => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  },

  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AuthStorage.getAuthToken();
    return !!token;
  }
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      console.log('🔍 Checking existing authentication...');
      const token = await AuthStorage.getAuthToken();
      const userData = await AuthStorage.getUserData();
      
      console.log('🔍 Auth check results:', {
        hasToken: !!token,
        hasUserData: !!userData,
        userRole: userData?.role
      });
      
      if (token && userData) {
        console.log('✅ Found existing auth data:', userData);
        redirectBasedOnRole(userData);
      } else {
        console.log('❌ No existing auth data found');
      }
    } catch (error) {
      console.error('❌ Error checking existing auth:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  const handleLogin = async () => {
    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedIdentifier) {
      setIdentifierError('Email or username is required');
      return;
    }
    
    if (!trimmedPassword) {
      setPasswordError('Password is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🚀 Starting login process...');
      const data = await authService.login({
        identifier: trimmedIdentifier,
        password: trimmedPassword,
      });
      
      console.log('📋 Raw login response from authService:', JSON.stringify(data, null, 2));
      
      // ==================== GOOGLE PLAY STORE 2FA BYPASS ====================
      const isTestUser = TEST_USERS.includes(trimmedIdentifier.toLowerCase());
      
      // Extract data from response
      const token = data.token || '';
      const refreshToken = (data as any).refresh_token || (data as any).refreshToken || '';
      
      console.log('📋 Processed login response:', {
        requires2FA: data.requires2FA,
        isTestUser,
        hasToken: !!token,
        userId: data.userId,
        email: data.email,
        role: data.role
      });
      
      // FOR ALL TEST USERS: ALWAYS bypass 2FA - store token and redirect immediately
      if (isTestUser) {
        if (token) {
          console.log('🔓 TEST USER: Bypassing 2FA, storing tokens:', trimmedIdentifier);
          const user = data.user || { 
            id: data.userId, 
            email: data.email, 
            role: data.role
          };
          await AuthStorage.setAuthData(token, refreshToken, user);
          console.log('✅ TEST USER: Tokens stored successfully');
          redirectBasedOnRole(user);
          return;
        } else {
          console.error('❌ TEST USER: No token received from backend');
          Alert.alert('Error', 'Test user authentication failed. Backend did not return token.');
          return;
        }
      }
      
      // 🚨 CRITICAL FIX: Handle 2FA response with enhanced data extraction
      if (data.requires2FA && !token) {
        console.log('🔐 2FA required - processing response');
        
        // 🚨 FIX: Extract data with multiple fallback options
        const twoFactorData = {
          userId: data.userId || (data as any).userId,
          email: data.email || (data as any).email,
          role: data.role || (data as any).role
        };
        
        console.log('🔐 2FA navigation data:', twoFactorData);
        
        // 🚨 FIX: Enhanced validation with fallback for email
        if (!twoFactorData.userId) {
          console.error('❌ Missing userId in 2FA data:', twoFactorData);
          Alert.alert('Error', 'Authentication data incomplete. Missing user ID.');
          return;
        }
        
        // If email is missing, try to use the identifier as fallback
        if (!twoFactorData.email && trimmedIdentifier.includes('@')) {
          twoFactorData.email = trimmedIdentifier.toLowerCase();
          console.log('🔄 Using identifier as email fallback:', twoFactorData.email);
        }
        
        if (!twoFactorData.email) {
          console.error('❌ Missing email in 2FA data:', twoFactorData);
          Alert.alert('Error', 'Authentication data incomplete. Missing email address.');
          return;
        }
        
        // Ensure role has a default value
        if (!twoFactorData.role) {
          twoFactorData.role = 'user';
          console.log('🔄 Using default role:', twoFactorData.role);
        }
        
        console.log('✅ Final 2FA navigation data:', twoFactorData);
        
        // Navigate to 2FA screen
        (navigation as any).navigate('TwoFactorAuth', twoFactorData);
        return;
      }
      
      // Regular login with token (non-2FA user)
      if (token) {
        console.log('✅ Login successful, storing tokens...');
        const user = data.user || { 
          id: data.userId, 
          email: data.email, 
          role: data.role
        };
        await AuthStorage.setAuthData(token, refreshToken, user);
        console.log('🎯 Redirecting to dashboard...');
        redirectBasedOnRole(user);
        return;
      }
      
      // No token and no 2FA - error state
      console.error('❌ No token received and no 2FA required - invalid state');
      Alert.alert('Error', 'Authentication response invalid. Please try again.');
      
    } catch (error: any) {
      console.error('❌ Login failed:', error?.response?.data || error?.message);
      
      let errorMessage = error?.message || 'Login failed. Please check your credentials.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (errorMessage.includes('verify your email')) {
        errorMessage = 'Please verify your email before logging in. Check your inbox for the verification code.';
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (errorMessage.includes('401') || errorMessage.includes('Invalid credentials')) {
        errorMessage = 'Invalid email/username or password. Please check your credentials.';
      } else if (errorMessage.includes('pending approval')) {
        errorMessage = 'Your account is pending admin approval. Please wait for approval or contact support.';
      } else if (errorMessage.includes('suspended')) {
        errorMessage = 'Your account has been suspended. Please contact support.';
      } else if (errorMessage.includes('email not verified')) {
        errorMessage = 'Please verify your email address before logging in. Check your email for the verification code.';
      } else if (errorMessage.includes('Missing userId or email')) {
        errorMessage = 'Authentication data incomplete. Please try again or contact support.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectBasedOnRole = (user: any) => {
    console.log('🎯 Redirecting based on role:', user.role);
    
    // Use reset to clear navigation stack and prevent going back to login
    switch (user.role) {
      case 'admin':
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminDashboard' as never }],
        });
        break;
      case 'fact_checker':
        navigation.reset({
          index: 0,
          routes: [{ name: 'FactCheckerDashboard' as never }],
        });
        break;
      default:
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeScreen' as never }],
        });
    }
  };
  
  const handleNavigateToSignUp = () => {
    navigation.navigate('Signup' as never);
  };

  const embassyImage = require('../assets/images/emabsy_of_finlad.png');
  const crecoImage = require('../assets/images/creco-kenya.png');

  if (isCheckingAuth) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className="text-gray-600 mt-4">Checking authentication...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView 
        contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View className="flex-1 bg-white pt-12">
          <View className="px-6 pb-4">
            <View className="mb-6">
              <Text className="text-2xl font-pbold text-gray-900 text-center mb-2">
                HAKIKISHA
              </Text>
              <Text className="text-sm font-pregular text-gray-600 text-center">
                Sign in to continue
              </Text>
            </View>

            <LineInputField
              title="Email or Username"
              value={identifier}
              placeholder="Enter your email or username"
              onChangeText={(text) => {
                setIdentifierError('');
                setIdentifier(text);
              }}
              error={identifierError}
              fieldName="identifier"
              focusedField={focusedField}
              onFocus={() => setFocusedField('identifier')}
              onBlur={() => setFocusedField(null)}
            />

            <LineInputField
              title="Password"
              value={password}
              placeholder="Enter your password"
              onChangeText={(text) => {
                setPasswordError('');
                setPassword(text);
              }}
              error={passwordError}
              secureTextEntry={true}
              fieldName="password"
              focusedField={focusedField}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />

            <TouchableOpacity onPress={handleForgotPassword} className="mb-5">
              <Text className="text-[#EF9334] text-sm font-pmedium self-end">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <CustomButton
              title={isSubmitting ? "Signing In..." : "Sign In"}
              handlePress={handleLogin}
              isLoading={isSubmitting}
              containerStyle="py-2 mb-3"
              disabled={isSubmitting}
            />
            
            <CustomButton
              title="Create Account"
              handlePress={handleNavigateToSignUp}
              containerStyle="py-2 bg-white border-2 border-gray-300"
              textStyle="text-[#0A864D] text-sm"
            />
          </View>

          {/* Powered by section */}
          <View className="px-4 pb-4 mt-4">
            <Text className="text-sm font-pregular text-gray-500 text-center mb-2">
              Powered by
            </Text>
            <View className="flex-row justify-between items-center px-2">
              <View className="flex-1 items-center">
                <Image 
                  source={embassyImage}
                  className="w-32 h-20"
                  resizeMode="contain"
                />
              </View>
              
              <View className="flex-1 items-center">
                <Image 
                  source={crecoImage}
                  className="w-32 h-20"
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;