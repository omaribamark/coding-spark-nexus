import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomButton } from '@/components';
import LineInputField from '@/components/LineInputField';
import { authService } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TEST_USERS = [
  'admin.bypass@hakikisha.com',
  'factchecker.bypass@hakikisha.com', 
  'user.normal@hakikisha.com'
];

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'user_data';

const AuthStorage = {
  setAuthData: async (token: string, refreshToken: string, user: any) => {
    try {
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [REFRESH_TOKEN_KEY, refreshToken || ''],
        [USER_DATA_KEY, JSON.stringify(user)]
      ]);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  },

  getAuthToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  getUserData: async (): Promise<any> => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },
};

const LoginScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      const token = await AuthStorage.getAuthToken();
      const userData = await AuthStorage.getUserData();
      
      if (token && userData) {
        redirectBasedOnRole(userData);
      }
    } catch (error) {
      console.error('Error checking existing auth:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
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
      const data = await authService.login({
        identifier: trimmedIdentifier,
        password: trimmedPassword,
      });
      
      const isTestUser = TEST_USERS.includes(trimmedIdentifier.toLowerCase());
      const token = data.token || '';
      const refreshToken = (data as any).refresh_token || (data as any).refreshToken || '';
      
      if (isTestUser) {
        if (token) {
          const user = data.user || { id: data.userId, email: data.email, role: data.role };
          await AuthStorage.setAuthData(token, refreshToken, user);
          redirectBasedOnRole(user);
          return;
        } else {
          Alert.alert('Error', 'Test user authentication failed.');
          return;
        }
      }
      
      if (data.requires2FA && !token) {
        router.push({
          pathname: '/two-factor-auth',
          params: {
            userId: data.userId,
            email: data.email || trimmedIdentifier,
            role: data.role || 'user',
          }
        });
        return;
      }
      
      if (token) {
        const user = data.user || { id: data.userId, email: data.email, role: data.role };
        await AuthStorage.setAuthData(token, refreshToken, user);
        redirectBasedOnRole(user);
        return;
      }
      
      Alert.alert('Error', 'Authentication response invalid. Please try again.');
      
    } catch (error: any) {
      console.error('Login failed:', error);
      let errorMessage = error?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectBasedOnRole = (user: any) => {
    switch (user.role) {
      case 'admin':
        router.replace('/admin-dashboard');
        break;
      case 'fact_checker':
        router.replace('/fact-checker-dashboard');
        break;
      default:
        router.replace('/(tabs)');
    }
  };
  
  const handleNavigateToSignUp = () => {
    router.push('/signup');
  };

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0A864D" />
        <Text style={{ color: '#4B5563', marginTop: 16 }}>Checking authentication...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: insets.top + 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
                HAKIKISHA
              </Text>
              <Text style={{ fontSize: 14, color: '#4B5563', textAlign: 'center' }}>
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

            <TouchableOpacity onPress={handleForgotPassword} style={{ marginBottom: 20 }}>
              <Text style={{ color: '#EF9334', fontSize: 14, fontWeight: '500', alignSelf: 'flex-end' }}>
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
          <View style={{ paddingHorizontal: 16, paddingBottom: 16, marginTop: 16 }}>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 8 }}>
              Powered by
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Image 
                  source={require('@/assets/images/emabsy_of_finlad.png')}
                  style={{ width: 128, height: 80 }}
                  resizeMode="contain"
                />
              </View>
              
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Image 
                  source={require('@/assets/images/creco-kenya.png')}
                  style={{ width: 128, height: 80 }}
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
