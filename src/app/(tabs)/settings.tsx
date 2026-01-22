import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
  StatusBar,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { icons } from '@/constants';
import { userService } from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  phone_number?: string;
  role: string;
  profile_picture?: string;
}

const SettingTab = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'authToken',
                'refreshToken',
                'user_data',
                'auth_token',
                'userToken',
                'userEmail',
                'userName',
              ]);
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0A864D" />
        <Text style={{ color: '#4B5563', marginTop: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#F9FAFB', paddingTop: insets.top }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#F9FAFB"} translucent />
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={{ backgroundColor: isDark ? '#1F2937' : '#fff', paddingTop: 16, paddingBottom: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#E5E7EB' }}>
          <Text style={{ color: isDark ? '#fff' : '#111827', fontSize: 16, fontWeight: '700' }}>Settings</Text>
          <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, marginTop: 2 }}>Manage your account</Text>
        </View>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <TouchableOpacity
            style={{ backgroundColor: isDark ? '#1F2937' : '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#374151' : '#F3F4F6' }}
            onPress={() => router.push('/profile')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={profile?.profile_picture ? { uri: profile.profile_picture } : icons.profile} 
                style={{ width: 48, height: 48, marginRight: 16, borderRadius: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#E5E7EB' }}
                resizeMode="cover"
              />
              <View>
                <Text style={{ color: isDark ? '#fff' : '#1F2937', fontWeight: '600', fontSize: 16 }}>My Profile</Text>
                <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, marginTop: 4 }}>Personal information</Text>
              </View>
            </View>
            <Image source={icons.arrow_right} style={{ width: 20, height: 20, tintColor: isDark ? '#9CA3AF' : undefined }} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: isDark ? '#1F2937' : '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#374151' : '#F3F4F6' }}
            onPress={() => router.push('/about-app')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? '#374151' : '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Text style={{ fontSize: 20 }}>ℹ️</Text>
              </View>
              <View>
                <Text style={{ color: isDark ? '#fff' : '#1F2937', fontWeight: '600', fontSize: 16 }}>About App</Text>
                <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, marginTop: 4 }}>How HAKIKISHA works</Text>
              </View>
            </View>
            <Image source={icons.arrow_right} style={{ width: 20, height: 20, tintColor: isDark ? '#9CA3AF' : undefined }} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: isDark ? '#1F2937' : '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#374151' : '#F3F4F6' }}
            onPress={() => router.push('/privacy-policy')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? '#374151' : '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Image source={icons.lock} style={{ width: 24, height: 24, tintColor: isDark ? '#60A5FA' : '#3B82F6' }} resizeMode="contain" />
              </View>
              <View>
                <Text style={{ color: isDark ? '#fff' : '#1F2937', fontWeight: '600', fontSize: 16 }}>Privacy Policy</Text>
                <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, marginTop: 4 }}>Read our privacy policy</Text>
              </View>
            </View>
            <Image source={icons.arrow_right} style={{ width: 20, height: 20, tintColor: isDark ? '#9CA3AF' : undefined }} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: isDark ? '#1F2937' : '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#374151' : '#F3F4F6' }}
            onPress={() => {
              const email = 'kellynyachiro@gmail.com';
              const subject = 'Feedback from HAKIKISHA User';
              const body = 'Hello,\n\nI would like to provide feedback about...\n\n';
              const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              
              Linking.canOpenURL(mailto)
                .then((supported) => {
                  if (supported) {
                    return Linking.openURL(mailto);
                  } else {
                    Alert.alert('Email Not Available', 'Please send your feedback to kellynyachiro@gmail.com');
                  }
                })
                .catch(() => Alert.alert('Error', 'Unable to open email client'));
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? '#374151' : '#F3E8FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Text style={{ fontSize: 20 }}>💬</Text>
              </View>
              <View>
                <Text style={{ color: isDark ? '#fff' : '#1F2937', fontWeight: '600', fontSize: 16 }}>Feedback</Text>
                <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, marginTop: 4 }}>Contact fact-checkers</Text>
              </View>
            </View>
            <Image source={icons.arrow_right} style={{ width: 20, height: 20, tintColor: isDark ? '#9CA3AF' : undefined }} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: '#EF9334', borderRadius: 12, padding: 16, marginTop: 12 }} 
            onPress={handleLogout}>
            <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 16 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingTab;
