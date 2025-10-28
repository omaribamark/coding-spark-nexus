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

type RootStackParamList = {
  ForgotPassword: undefined;
  Signup: undefined;
  HomeScreen: undefined;
  AdminDashboard: undefined;
  FactCheckerDashboard: undefined;
};

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
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
      console.log('Checking existing authentication...');
      const authData = await authService.getStoredAuthData();
      if (authData) {
        console.log('Found existing auth data:', authData.user);
        redirectBasedOnRole(authData.user);
      } else {
        console.log('No existing auth data found');
      }
    } catch (error) {
      console.error('Error checking existing auth:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter email/username and password');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting login process...');
      const data = await authService.login({
        email: identifier,
        password: password,
      });
      
      console.log('Login successful:', data.user);
      redirectBasedOnRole(data.user);
      setIsSubmitting(false);
      
    } catch (error: any) {
      setIsSubmitting(false);
      console.error('Login failed:', error?.message);
      
      let errorMessage = error?.message || 'Login failed. Please check your credentials.';
      
      if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (errorMessage.includes('401')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (errorMessage.includes('pending approval')) {
        errorMessage = 'Your account is pending admin approval. Please wait for approval or contact support.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    }
  };


  const redirectBasedOnRole = (user: any) => {
    console.log('Redirecting based on role:', user.role);
    switch (user.role) {
      case 'admin':
        navigation.navigate('AdminDashboard');
        break;
      case 'fact_checker':
        navigation.navigate('FactCheckerDashboard');
        break;
      default:
        navigation.navigate('HomeScreen');
    }
  };
  
  const handleNavigateToSignUp = () => {
    navigation.navigate('Signup');
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
              onChangeText={(text: string) => {
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
              onChangeText={(text: string) => {
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