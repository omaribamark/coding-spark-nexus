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
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import {CustomButton} from '../components';
import LineInputField from '../components/LineInputField';

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
  const [countryCode, setCountryCode] = useState<CountryCode>('KE');
  const [country, setCountry] = useState<Country | null>(null);
  const [callingCode, setCallingCode] = useState('254');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const onSelectCountry = (selectedCountry: Country) => {
    setCountry(selectedCountry);
    setCountryCode(selectedCountry.cca2);
    setCallingCode(String(selectedCountry.callingCode[0]));
    setShowCountryPicker(false);
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignup = async () => {
    if (!email || !username || !password || !phoneNumber || !country) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { authService } = require('../services/authService');
      await authService.register({
        email: email,
        password: password,
        full_name: username,
        phone_number: `+${callingCode}${phoneNumber}`,
        country: country ? (typeof country.name === 'string' ? country.name : country.name.common || '') : '',
      });
      
      setIsSubmitting(false);
      Alert.alert('Success', 'Account created successfully! Please login.');
      navigation.navigate('Login');
      
    } catch (error: any) {
      setIsSubmitting(false);
      const message = error.response?.data?.error || 'Signup failed. Please try again.';
      Alert.alert('Error', message);
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
                setEmailError('');
                setEmail(text);
              }}
              error={emailError}
              fieldName="email"
              focusedField={focusedField}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
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
                className={`border-b-2 ${focusedField === 'country' ? 'border-[#0A864D]' : 'border-gray-300'} py-2`}>
                <View className="flex-row items-center">
                  <CountryPicker
                    countryCode={countryCode}
                    withFilter
                    withFlag
                    withCountryNameButton
                    withAlphaFilter
                    withCallingCode
                    onSelect={onSelectCountry}
                    visible={showCountryPicker}
                    onClose={() => setShowCountryPicker(false)}
                  />
                  <Text className="text-gray-800 font-pregular ml-2">
                    {country ? (typeof country.name === 'string' ? country.name : country.name.common || 'Select Country') : 'Select Country'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <Text className="text-sm font-pmedium text-gray-800 mb-1">Phone Number</Text>
              <View className="flex-row items-center">
                <View className={`border-b-2 ${focusedField === 'phoneCode' ? 'border-[#0A864D]' : 'border-gray-300'} mr-2`}>
                  <Text className="text-gray-800 font-pmedium py-2 px-2">+{callingCode}</Text>
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
                <Text className="text-[#0A864D] font-pmedium">Terms and Conditions</Text>
                {' '}and{' '}
                <Text className="text-[#0A864D] font-pmedium">Privacy Policy</Text>
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
                <Text className="text-[#0A864D] text-sm font-pbold">
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