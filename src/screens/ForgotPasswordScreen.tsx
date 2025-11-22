import {View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Alert} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CustomButton} from '../components';
import LineInputField from '../components/LineInputField';
import {authService} from '../services/authService';

type Props = {};

type ResetStep = 'email' | 'otp' | 'password' | 'success';

const ForgotPasswordScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<ResetStep>('email');
  
  // Email step
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // OTP step
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  
  // Password step
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Email validation regex
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_MIN_LENGTH = 8;

  // Timer for OTP expiration
  useEffect(() => {
    if (currentStep === 'otp' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setEmailError('Please enter your email address');
      Alert.alert('Email Required', 'Please enter your email address to reset your password.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g., example@domain.com).');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await authService.forgotPassword(trimmedEmail);
      setIsSubmitting(false);
      setCurrentStep('otp');
      setTimeLeft(900); // Reset timer
      Alert.alert('OTP Sent', 'A 6-digit verification code has been sent to your email.');
    } catch (error: any) {
      setIsSubmitting(false);
      const errorMessage = error.response?.data?.error || error.message || 'Unable to send OTP. Please verify your email address and try again.';
      setEmailError(errorMessage);
      Alert.alert('Failed', errorMessage);
    }
  };

  const handleResendOTP = async () => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setTimeLeft(900); // Reset timer
      setOtpError('');
      setIsSubmitting(false);
      Alert.alert('OTP Resent', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert('Failed', 'Unable to resend OTP. Please try again.');
    }
  };

const handleResetPassword = async () => {
  const trimmedOTP = otp.trim();
  const trimmedPassword = newPassword.trim();
  const trimmedConfirm = confirmPassword.trim();

  // Validate OTP
  if (!trimmedOTP) {
    setOtpError('Please enter the verification code');
    Alert.alert('Code Required', 'Please enter the 6-digit verification code sent to your email.');
    return;
  }

  if (trimmedOTP.length !== 6) {
    setOtpError('Code must be 6 digits');
    Alert.alert('Invalid Code', 'Verification code must be 6 digits.');
    return;
  }

  // Validate password
  if (!trimmedPassword) {
    setPasswordError('Please enter a new password');
    Alert.alert('Password Required', 'Please enter a new password.');
    return;
  }

  if (trimmedPassword.length < PASSWORD_MIN_LENGTH) {
    setPasswordError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    Alert.alert('Weak Password', `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
    return;
  }

  if (trimmedPassword !== trimmedConfirm) {
    setPasswordError('Passwords do not match');
    Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
    return;
  }

  setIsSubmitting(true);
  
  try {
    console.log('Attempting password reset for:', email.trim());
    await authService.resetPassword(email.trim(), trimmedOTP, trimmedPassword);
    setIsSubmitting(false);
    setCurrentStep('success');
  } catch (error: any) {
    setIsSubmitting(false);
    console.error('Password reset error:', error);
    
    let errorMessage = 'Unable to reset password. Please check your code and try again.';
    
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific error cases
    if (errorMessage.includes('expired')) {
      setOtpError('Reset code has expired. Please request a new one.');
      Alert.alert('Code Expired', 'Your reset code has expired. Please request a new verification code.');
    } else if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
      setOtpError('Invalid reset code. Please check the code and try again.');
      Alert.alert('Invalid Code', 'The verification code you entered is invalid. Please check and try again.');
    } else {
      setOtpError(errorMessage);
      Alert.alert('Reset Failed', errorMessage);
    }
  }
};

  const embassyImage = require('../assets/images/emabsy_of_finlad.png');
  const crecoImage = require('../assets/images/creco-kenya.png');

  const renderContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <View>
            <View className="mb-4">
              <Text className="text-2xl font-pbold text-gray-900 mb-1 text-center">
                Reset Password
              </Text>
              <Text className="text-sm font-pregular text-gray-600 text-center">
                Enter your email to receive a verification code
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

            <CustomButton
              title="Send Verification Code"
              handlePress={handleSendOTP}
              isLoading={isSubmitting}
              containerStyle="py-2 mb-3"
            />

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-[#0A864D] text-sm font-pmedium text-center">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'otp':
        return (
          <View>
            <View className="mb-4">
              <Text className="text-2xl font-pbold text-gray-900 mb-1 text-center">
                Enter Verification Code
              </Text>
              <Text className="text-sm font-pregular text-gray-600 text-center">
                We sent a 6-digit code to {email}
              </Text>
            </View>

            <LineInputField
              title="Verification Code"
              value={otp}
              placeholder="Enter 6-digit code"
              onChangeText={(text: string) => {
                setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
                setOtpError('');
              }}
              error={otpError}
              fieldName="otp"
              focusedField={focusedField}
              onFocus={() => setFocusedField('otp')}
              onBlur={() => setFocusedField(null)}
              keyboardType="number-pad"
            />

            <View className="mb-4">
              <Text className="text-sm font-pregular text-gray-600 text-center">
                Code expires in: <Text className="font-pmedium text-[#0A864D]">{formatTime(timeLeft)}</Text>
              </Text>
            </View>

            <CustomButton
              title="Continue"
              handlePress={() => {
                if (!otp.trim()) {
                  setOtpError('Please enter the verification code');
                  Alert.alert('Code Required', 'Please enter the 6-digit verification code.');
                  return;
                }
                if (otp.length !== 6) {
                  setOtpError('Code must be 6 digits');
                  Alert.alert('Invalid Code', 'Verification code must be 6 digits.');
                  return;
                }
                setCurrentStep('password');
              }}
              isLoading={isSubmitting}
              containerStyle="py-2 mb-3"
            />

            <TouchableOpacity 
              onPress={handleResendOTP}
              disabled={timeLeft > 840 || isSubmitting} // Disable for first 60 seconds
            >
              <Text className={`text-sm font-pmedium text-center ${timeLeft > 840 ? 'text-gray-400' : 'text-[#0A864D]'}`}>
                {timeLeft > 840 ? `Resend code in ${900 - timeLeft}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setCurrentStep('email')}
              className="mt-2"
            >
              <Text className="text-gray-600 text-sm font-pmedium text-center">
                Change Email
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'password':
        return (
          <View>
            <View className="mb-4">
              <Text className="text-2xl font-pbold text-gray-900 mb-1 text-center">
                Create New Password
              </Text>
              <Text className="text-sm font-pregular text-gray-600 text-center">
                Enter your new password
              </Text>
            </View>

            <LineInputField
              title="New Password"
              value={newPassword}
              placeholder="Enter new password"
              onChangeText={(text: string) => {
                setNewPassword(text);
                if (text && text.length < PASSWORD_MIN_LENGTH) {
                  setPasswordError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
                } else {
                  setPasswordError('');
                }
              }}
              error={passwordError}
              fieldName="newPassword"
              focusedField={focusedField}
              onFocus={() => setFocusedField('newPassword')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={true}
            />

            <LineInputField
              title="Confirm Password"
              value={confirmPassword}
              placeholder="Confirm new password"
              onChangeText={(text: string) => {
                setConfirmPassword(text);
                if (text && newPassword && text !== newPassword) {
                  setPasswordError('Passwords do not match');
                } else if (passwordError === 'Passwords do not match') {
                  setPasswordError('');
                }
              }}
              error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
              fieldName="confirmPassword"
              focusedField={focusedField}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={true}
            />

            <CustomButton
              title="Reset Password"
              handlePress={handleResetPassword}
              isLoading={isSubmitting}
              containerStyle="py-2 mb-3"
            />

            <TouchableOpacity onPress={() => setCurrentStep('otp')}>
              <Text className="text-gray-600 text-sm font-pmedium text-center">
                Back to Verification Code
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'success':
        return (
          <View>
            <View className="mb-4">
              <Text className="text-2xl font-pbold text-gray-900 mb-1 text-center">
                Password Reset Successful
              </Text>
              <Text className="text-sm font-pregular text-gray-600 text-center">
                Your password has been reset successfully
              </Text>
            </View>

            <View className="bg-green-50 rounded-xl p-4 mb-3">
              <Text className="text-green-800 text-sm font-pmedium text-center">
                ✓ Password reset successfully!
              </Text>
              <Text className="text-green-700 text-sm font-pregular text-center mt-1">
                You can now log in with your new password
              </Text>
            </View>

            <CustomButton
              title="Go to Login"
              handlePress={() => navigation.navigate('Login')}
              containerStyle="py-2"
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView 
        contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 bg-white justify-center">
          <View className="px-6 pb-4 mt-32">
            {renderContent()}
          </View>

          {/* Powered by section at bottom */}
          <View className="px-4 pb-4">
            <Text className="text-sm font-pregular text-gray-500 text-center mb-2">
              Powered by
            </Text>
            <View className="flex-row justify-between items-center px-2">
              <View className="flex-1 items-center">
                <Image 
                  source={embassyImage}
                  className="w-36 h-16"
                  resizeMode="contain"
                />
              </View>
              
              <View className="flex-1 items-center">
                <Image 
                  source={crecoImage}
                  className="w-36 h-16"
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

export default ForgotPasswordScreen;