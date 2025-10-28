import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {icons} from '../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import { userService } from '../services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  phone_number?: string;
  role: string;
  profile_picture?: string;
}

type Props = {};

const SettingTab = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList>>();
  const { isDark, toggleTheme } = useTheme();
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
              await AsyncStorage.removeItem('auth_token');
              await AsyncStorage.removeItem('user_data');
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('userName');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
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
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className="text-gray-600 mt-4 font-pregular">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Simple Header */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} pt-4 pb-4 px-6 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b`}>
        <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-base font-pbold`}>Settings</Text>
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs mt-0.5 font-pregular`}>Manage your account</Text>
      </View>

      {/* Menu Items */}
      <View className="px-5 mt-4">
        <TouchableOpacity
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-4 mb-3 shadow-sm flex-row items-center justify-between border`}
          onPress={() => navigation.navigate('Profile')}>
          <View className="flex-row items-center">
            <Image 
              source={profile?.profile_picture ? {uri: profile.profile_picture} : icons.profile} 
              className={`w-12 h-12 mr-4 rounded-full ${isDark ? 'border-gray-700' : 'border-gray-200'} border`}
              resizeMode="cover"
            />
            <View>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-psemibold text-base`}>My Profile</Text>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pregular text-xs mt-1`}>
                Personal information
              </Text>
            </View>
          </View>
          <Image 
            source={icons.arrow_right} 
            className="w-5 h-5" 
            resizeMode="contain"
            style={{ tintColor: isDark ? '#9CA3AF' : undefined }}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-4 mb-3 shadow-sm flex-row items-center justify-between border`}
          onPress={() => navigation.navigate('AboutApp')}>
          <View className="flex-row items-center">
            <View className={`w-12 h-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-green-50'} items-center justify-center mr-4`}>
              <Text className="text-xl">ℹ️</Text>
            </View>
            <View>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-psemibold text-base`}>About App</Text>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pregular text-xs mt-1`}>
                How HAKIKISHA works
              </Text>
            </View>
          </View>
          <Image 
            source={icons.arrow_right} 
            className="w-5 h-5" 
            resizeMode="contain"
            style={{ tintColor: isDark ? '#9CA3AF' : undefined }}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-4 mb-3 shadow-sm flex-row items-center justify-between border`}
          onPress={() => navigation.navigate('PrivacyPolicy')}>
          <View className="flex-row items-center">
            <View className={`w-12 h-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-blue-50'} items-center justify-center mr-4`}>
              <Image 
                source={icons.lock} 
                className="w-6 h-6" 
                resizeMode="contain" 
                style={{ tintColor: isDark ? '#60A5FA' : '#3B82F6' }}
              />
            </View>
            <View>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-psemibold text-base`}>Privacy Policy</Text>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pregular text-xs mt-1`}>
                Read our privacy policy
              </Text>
            </View>
          </View>
          <Image 
            source={icons.arrow_right} 
            className="w-5 h-5" 
            resizeMode="contain"
            style={{ tintColor: isDark ? '#9CA3AF' : undefined }}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{backgroundColor: '#EF9334'}} 
          className="rounded-xl p-4 mt-3" 
          onPress={handleLogout}>
          <Text className="text-white font-pbold text-center text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingTab;