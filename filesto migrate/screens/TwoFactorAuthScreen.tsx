import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== GOOGLE PLAY STORE 2FA BYPASS ====================
// Test users that should NEVER reach this screen - they bypass 2FA completely
const TEST_USERS = [
  'admin.bypass@hakikisha.com',
  'factchecker.bypass@hakikisha.com',
  'user.normal@hakikisha.com'
];

// Storage keys
const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'user_data';

const AuthStorage = {
  setAuthData: async (token: string, refreshToken: string, user: any) => {
    try {
      console.log('💾 Storing auth data...', {
        token: token ? 'Yes' : 'No',
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
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
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
  }
};

type TwoFactorRouteProps = {
  TwoFactorAuth: {
    userId: string;
    email: string;
    role: string;
  };
};

const TwoFactorAuthScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<TwoFactorRouteProps, 'TwoFactorAuth'>>();
  const { userId, email, role } = route.params || {};

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Safe email check function
  const isTestUser = (email: string | undefined): boolean => {
    if (!email) return false;
    return TEST_USERS.includes(email.toLowerCase());
  };

  // Test users should NEVER reach this screen - auto-redirect them
  useEffect(() => {
    if (isTestUser(email)) {
      console.log('🔄 TEST USER: Auto-bypassing 2FA for:', email);
      handleAutoBypass();
    }
  }, [email, role, navigation]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleAutoBypass = async () => {
    setLoading(true);
    try {
      console.log('🔓 Auto-bypassing 2FA for test user:', email);
      
      // For test users, we need to simulate a successful login
      const mockUserData = {
        id: userId || 'test_user_id',
        email: email || 'test@hakikisha.com',
        role: role || 'user',
        username: email ? email.split('@')[0] : 'testuser',
        is_verified: true,
        registration_status: 'approved',
        two_factor_enabled: false
      };
      
      // Generate a mock token (in real scenario, this should come from backend)
      const mockToken = `test_token_${Date.now()}_${email || 'test'}`;
      const mockRefreshToken = `test_refresh_${Date.now()}_${email || 'test'}`;
      
      await AuthStorage.setAuthData(mockToken, mockRefreshToken, mockUserData);
      console.log('✅ TEST USER: Auto-bypass completed, redirecting...');
      
      redirectBasedOnRole(mockUserData);
      
    } catch (error) {
      console.error('❌ Auto-bypass failed:', error);
      Alert.alert('Error', 'Auto-bypass failed. Please contact support.');
      navigation.navigate('Login' as never);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && text) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const redirectBasedOnRole = async (user: any) => {
    try {
      console.log('🎯 Redirecting based on role:', user.role);
      
      let routeName = 'HomeScreen';
      switch (user.role) {
        case 'admin':
          routeName = 'AdminDashboard';
          break;
        case 'fact_checker':
          routeName = 'FactCheckerDashboard';
          break;
        default:
          routeName = 'HomeScreen';
      }
      
      navigation.reset({
        index: 0,
        routes: [{ name: routeName as never }],
      });
      
    } catch (error) {
      console.error('❌ Error during redirect:', error);
      Alert.alert('Error', 'Failed to redirect. Please try again.');
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    // If this is a test user, they should have been auto-verified already
    if (isTestUser(email)) {
      console.log('⚠️ Test user attempting manual 2FA verification, this should not happen');
      return;
    }

    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Verifying 2FA code...');
      const data = await authService.verify2FA(userId, codeToVerify);
      console.log('✅ 2FA verification successful:', data);
      
      await AuthStorage.setAuthData(data.token, data.refresh_token, data.user);
      await redirectBasedOnRole(data.user);
      
    } catch (error: any) {
      console.error('❌ 2FA verification failed:', error);
      
      let errorMessage = error.message || 'Invalid or expired code';
      if (errorMessage.includes('No auth token') || errorMessage.includes('refresh token')) {
        errorMessage = 'Authentication error. Please try logging in again.';
      }
      
      Alert.alert('Verification Failed', errorMessage);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      console.log('🔄 Resending 2FA code...');
      await authService.resend2FA(userId, email);
      Alert.alert('Success', '2FA code sent to your email');
      setTimeLeft(600);
      setCanResend(false);
    } catch (error: any) {
      console.error('❌ Failed to resend 2FA code:', error);
      Alert.alert('Error', error.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Show error if required parameters are missing
  if (!email || !userId) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <Text className="text-lg font-pbold text-red-600 mb-4 text-center">
          Missing authentication data
        </Text>
        <Text className="text-sm font-pregular text-gray-600 mb-6 text-center">
          Please go back and try logging in again.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login' as never)}
          className="bg-[#0A864D] py-3 px-6 rounded-full"
        >
          <Text className="text-white text-center font-psemibold text-base">
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading while auto-bypassing 2FA for test users
  if (loading && isTestUser(email)) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className="text-lg font-pmedium text-gray-700 mt-4">
          Auto-bypassing 2FA for test user...
        </Text>
      </View>
    );
  }

  // If test user reached this screen but auto-bypass hasn't triggered yet
  if (isTestUser(email)) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className="text-lg font-pmedium text-gray-700 mt-4 text-center">
          Test user detected{'\n'}Auto-bypassing 2FA...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20">
          <View className="items-center mb-8">
            <View className="bg-blue-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">🔐</Text>
            </View>
            <Text className="text-2xl font-pbold text-gray-900 mb-2">
              Two-Factor Authentication
            </Text>
            <Text className="text-sm font-pregular text-gray-600 text-center">
              Enter the 6-digit code sent to
            </Text>
            <Text className="text-sm font-pmedium text-[#0A864D] mb-2">
              {email}
            </Text>
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-pmedium text-gray-700">
                {role === 'admin' ? 'Admin' : role === 'fact_checker' ? 'Fact Checker' : 'User'}
              </Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-pmedium text-gray-700 mb-3 text-center">
              Enter 2FA Code
            </Text>
            <View className="flex-row justify-between mb-4">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  className="w-12 h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-pbold text-gray-900"
                  autoFocus={index === 0}
                  editable={!loading}
                />
              ))}
            </View>

            <View className="items-center mb-6">
              {timeLeft > 0 ? (
                <Text className="text-sm font-pregular text-gray-600">
                  Code expires in:{' '}
                  <Text className="font-pmedium text-[#0A864D]">
                    {formatTime(timeLeft)}
                  </Text>
                </Text>
              ) : (
                <Text className="text-sm font-pregular text-red-600">
                  Code expired. Please request a new one.
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleVerify()}
            disabled={loading || code.some(d => !d)}
            className={`py-4 rounded-full mb-4 ${
              loading || code.some(d => !d)
                ? 'bg-gray-300'
                : 'bg-[#0A864D]'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-psemibold text-base">
                Verify & Login
              </Text>
            )}
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-sm font-pregular text-gray-600 mb-2">
              Didn't receive the code?
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend || loading}
            >
              <Text
                className={`text-sm font-pmedium ${
                  canResend && !loading
                    ? 'text-[#0A864D]' 
                    : 'text-gray-400'
                }`}
              >
                {canResend ? 'Resend Code' : `Resend (${formatTime(timeLeft)})`}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}
            className="mt-6 py-3"
          >
            <Text className="text-center text-sm font-pmedium text-gray-600">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TwoFactorAuthScreen;