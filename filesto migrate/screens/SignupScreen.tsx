import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {CustomButton} from '../components';
import LineInputField from '../components/LineInputField';
import { 
  CountryPickerModal, 
  CountryDisplay, 
  getDefaultCountry,
  type CountryData 
} from '../components/CountryPicker';

type RootStackParamList = {
  ForgotPassword: undefined;
  Login: undefined;
  HomeScreen: undefined;
};

const SignupScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Country picker state - using custom component
  const defaultCountry = getDefaultCountry();
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(defaultCountry);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Email validation regex
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignup = async () => {
    // Trim all inputs to handle spaces
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    
    if (!trimmedEmail || !trimmedUsername || !trimmedPassword || !trimmedPhoneNumber || !selectedCountry) {
      Alert.alert('Registration Error', 'Please fill all required fields to continue.');
      return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g., example@domain.com).');
      setEmailError('Please enter a valid email address');
      return;
    }

    // Validate phone number: must be 9 digits starting with 7 or 1
    if (trimmedPhoneNumber.length !== 9) {
      Alert.alert('Invalid Phone Number', 'Phone number must be exactly 9 digits.');
      return;
    }
    
    const firstDigit = trimmedPhoneNumber.charAt(0);
    if (firstDigit !== '7' && firstDigit !== '1') {
      Alert.alert('Invalid Phone Number', 'Phone number must start with 7 or 1.');
      return;
    }

    // Validate password length
    if (trimmedPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match. Please try again.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { authService } = require('../services/authService');
      const data = await authService.register({
        email: trimmedEmail,
        password: trimmedPassword,
        full_name: trimmedUsername,
        phone_number: `+${selectedCountry.callingCode}${trimmedPhoneNumber}`,
      });
      
      setIsSubmitting(false);
      
      // Check if email verification is required
      if (data.requiresEmailVerification) {
        Alert.alert(
          'Registration Successful',
          'Please check your email for a verification code to complete registration.',
          [
            {
              text: 'OK',
              onPress: () => (navigation as any).navigate('VerifyEmail', {
                userId: data.userId,
                email: data.email,
              })
            }
          ]
        );
        return;
      }
      
      Alert.alert('Account Created Successfully', 'Your account has been created. Please login to continue.');
      navigation.navigate('Login');
      
    } catch (error: any) {
      setIsSubmitting(false);
      const message = error.response?.data?.error || error.message || 'Registration failed. Please check your information and try again.';
      Alert.alert('Registration Failed', message);
    }
  };
  
  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };

  const embassyImage = require('../assets/images/emabsy_of_finlad.png');
  const crecoImage = require('../assets/images/creco-kenya.png');
  
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
          {/* Signup content first */}
          <View className="px-6 pb-4">
            <View className="mb-4">
              <Text className="text-2xl font-pbold text-gray-900 mb-1 text-center">
                Create Account
              </Text>
              <Text className="text-sm font-pregular text-gray-600 text-center">
                Join HAKIKISHA to verify Information
              </Text>
            </View>

            <LineInputField
              title="Email"
              value={email}
              placeholder="Enter your email"
              onChangeText={(text: string) => {
                setEmail(text);
                if (text && !EMAIL_REGEX.test(text.trim())) {
                  setEmailError('Please enter a valid email address');
                } else {
                  setEmailError('');
                }
              }}
              error={emailError}
              fieldName="email"
              focusedField={focusedField}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
            />

            <LineInputField
              title="Username"
              value={username}
              placeholder="Choose a username"
              onChangeText={(text: string) => {
                setUsername(text);
              }}
              error=""
              fieldName="username"
              focusedField={focusedField}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
            />

            <View className="mb-3">
              <Text className="text-sm font-pmedium text-gray-800 mb-1">Country</Text>
              <TouchableOpacity 
                onPress={() => setShowCountryPicker(true)}
                className={`border-b-2 ${focusedField === 'country' ? 'border-green-600' : 'border-gray-300'} py-2`}
                style={{ borderColor: focusedField === 'country' ? '#0A864D' : '#d1d5db' }}
              >
                <CountryDisplay
                  countryCode={selectedCountry.code}
                  onPress={() => setShowCountryPicker(true)}
                  showName={true}
                />
              </TouchableOpacity>
            </View>

            {/* Country Picker Modal */}
            <CountryPickerModal
              visible={showCountryPicker}
              onClose={() => setShowCountryPicker(false)}
              onSelect={onSelectCountry}
              selectedCountryCode={selectedCountry.code}
            />

            <View className="mb-3">
              <Text className="text-sm font-pmedium text-gray-800 mb-1">Phone Number</Text>
              <View className="flex-row items-center">
                <View className={`border-b-2 ${focusedField === 'phoneCode' ? 'border-green-600' : 'border-gray-300'} mr-2`}
                  style={{ borderColor: focusedField === 'phoneCode' ? '#0A864D' : '#d1d5db' }}
                >
                  <Text className="text-gray-800 font-pmedium py-2 px-2">+{selectedCountry.callingCode}</Text>
                </View>
                <View className="flex-1">
                  <LineInputField
                    title=""
                    value={phoneNumber}
                    placeholder="700 000 000"
                    onChangeText={(text: string) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                    error=""
                    fieldName="phoneNumber"
                    focusedField={focusedField}
                    onFocus={() => setFocusedField('phoneNumber')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            <LineInputField
              title="Password"
              value={password}
              placeholder="Create a password"
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

            <LineInputField
              title="Confirm Password"
              value={confirmPassword}
              placeholder="Confirm your password"
              onChangeText={(text: string) => {
                setConfirmPassword(text);
              }}
              error=""
              secureTextEntry={true}
              fieldName="confirmPassword"
              focusedField={focusedField}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
            />

            <View className="mb-4">
              <Text className="text-gray-600 text-xs font-pregular leading-5 text-center">
                By signing up, you agree to HAKIKISHA's{' '}
                <Text className="font-pmedium" style={{ color: '#0A864D' }}>Terms and Conditions</Text>
                {' '}and{' '}
                <Text className="font-pmedium" style={{ color: '#0A864D' }}>Privacy Policy</Text>
              </Text>
            </View>

            <CustomButton
              title="Sign Up"
              handlePress={handleSignup}
              isLoading={isSubmitting}
              containerStyle="py-2 mb-4"
            />

            <View className="flex-row items-center justify-center">
              <Text className="text-gray-600 text-sm font-pregular">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleNavigateToLogin}>
                <Text className="text-sm font-pbold" style={{ color: '#0A864D' }}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Powered by section moved to bottom */}
          <View className="px-4 pb-4">
            <Text className="text-sm font-pregular text-gray-500 text-center mb-2">
              Powered by
            </Text>
            <View className="flex-row justify-between items-center px-2">
              <View className="flex-1 items-center">
                <Image 
                  source={embassyImage}
                  className="w-32 h-16"
                  resizeMode="contain"
                />
              </View>
              
              <View className="flex-1 items-center">
                <Image 
                  source={crecoImage}
                  className="w-32 h-16"
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

export default SignupScreen;
