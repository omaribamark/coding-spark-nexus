import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('onboarded');
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (onboarded) {
        // User has seen onboarding, check if logged in
        if (authToken) {
          // User is logged in, go to home
          router.replace('/(tabs)');
        } else {
          // User not logged in, go to login
          router.replace('/login');
        }
      } else {
        // Show onboarding
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsLoading(false);
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('onboarded', 'true');
      router.replace('/get-started');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>HAKIKISHA</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Onboarding Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Image
          source={require('../assets/images/spash_1.png')}
          style={{ width: 300, height: 300, marginBottom: 32 }}
          resizeMode="contain"
        />
        
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#EF9334' }}>STOP</Text>
          <Text style={{ color: '#000' }}>.</Text>
          <Text style={{ color: '#0A864D' }}>REFLECT</Text>
          <Text style={{ color: '#000' }}>.</Text>
          <Text style={{ color: '#EF9334' }}>VERIFY</Text>
        </Text>
        
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginTop: 16, paddingHorizontal: 32 }}>
          Combat Misinformation. Verify Truth. Empower Democracy.
        </Text>
      </View>

      {/* Get Started Button */}
      <View style={{ padding: 24 }}>
        <View
          style={{
            backgroundColor: '#0A864D',
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text
            style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}
            onPress={handleGetStarted}
          >
            Get Started
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;
