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

type VerifyEmailRouteProps = {
  VerifyEmail: {
    userId: string;
    email: string;
  };
};

const VerifyEmailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<VerifyEmailRouteProps, 'VerifyEmail'>>();
  const { userId, email } = route.params;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmail(userId, codeToVerify);
      Alert.alert(
        'Success',
        'Email verified successfully! You can now log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid or expired code');
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
      await authService.resendVerification(email);
      Alert.alert('Success', 'Verification code sent to your email');
      setTimeLeft(600);
      setCanResend(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

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
            <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">✉️</Text>
            </View>
            <Text className="text-2xl font-pbold text-gray-900 mb-2">
              Verify Your Email
            </Text>
            <Text className="text-sm font-pregular text-gray-600 text-center">
              We've sent a 6-digit verification code to
            </Text>
            <Text className="text-sm font-pmedium text-[#0A864D]">
              {email}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-pmedium text-gray-700 mb-3 text-center">
              Enter Verification Code
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
                Verify Email
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
                  canResend && !loading ? 'text-[#0A864D]' : 'text-gray-400'
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

export default VerifyEmailScreen;
