import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GetStartedScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.replace('/login');
  };

  return (
    <ImageBackground
      source={require('@/assets/images/getstarted.png')}
      style={{ flex: 1, width: '100%', height: '100%' }}>
      <View style={{ height: '60%' }} />
      <View style={{ paddingHorizontal: 12, height: '40%', paddingTop: 12, backgroundColor: 'rgba(0,0,0,0.3)', width: '100%' }}>
        <Text style={{ color: '#fff', fontSize: 32, textAlign: 'center', fontWeight: '700' }}>
          HAKIKISHA
        </Text>
        <Text style={{ color: '#F2F2F2', fontSize: 18, fontWeight: '500', textAlign: 'center', marginTop: 12 }}>
          Combat Misinformation. Verify Truth. Empower Democracy.
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: '#0A864D',
            borderRadius: 12,
            paddingVertical: 16,
            marginTop: 32,
            marginBottom: insets.bottom + 16,
          }}
          onPress={handleGetStarted}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default GetStartedScreen;
