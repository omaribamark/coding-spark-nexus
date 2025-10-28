import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {icons} from '../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteStackParamList} from '../../App';
import {claimsService, Claim} from '../services/claimsService';
import { userService } from '../services/userService';
import { useTheme } from '../context/ThemeContext';

type Props = {};

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  phone_number?: string;
  role: string;
  profile_picture?: string;
}

const HomeTab: React.FC<Props> = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList>>();
  const { isDark } = useTheme();
  const [trendingClaims, setTrendingClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTrendingClaims();
    fetchUserProfile();
  }, []);

  const fetchTrendingClaims = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await claimsService.getTrendingClaims(10);
      setTrendingClaims(data);
    } catch (error: any) {
      console.error('Fetch trending claims error:', error);
      // Don't show alert for trending claims as they're not critical
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (): Promise<void> => {
    try {
      setProfileLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      // Don't show alert for profile as it's not critical for home screen
    } finally {
      setProfileLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([fetchTrendingClaims(), fetchUserProfile()]);
    setRefreshing(false);
  };

  const getStatusColor = (status: string, verdict?: string): string => {
    const finalStatus = verdict || status;
    
    switch (finalStatus) {
      case 'true':
      case 'resolved':
        return 'bg-green-100';
      case 'false':
        return 'bg-red-100';
      case 'misleading':
        return 'bg-orange-100';
      case 'unverifiable':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusTextColor = (status: string, verdict?: string): string => {
    const finalStatus = verdict || status;
    
    switch (finalStatus) {
      case 'true':
      case 'resolved':
        return 'text-green-700';
      case 'false':
        return 'text-red-700';
      case 'misleading':
        return 'text-orange-700';
      case 'unverifiable':
        return 'text-yellow-700';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusLabel = (status: string, verdict?: string): string => {
    // Use verdict if available, otherwise use status
    const finalStatus = verdict || status;
    
    switch (finalStatus) {
      case 'true':
      case 'resolved':
        return '✓ True';
      case 'false':
        return '✗ False';
      case 'misleading':
        return '⚠ Misleading';
      case 'unverifiable':
        return '📋 Unverifiable';
      default:
        return '⏳ Pending';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleClaimPress = (claimId: string): void => {
    navigation.navigate('ClaimDetails', { claimId });
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#FFFFFF"} />
      
      {/* Professional Header - Logo in absolute left corner */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} pt-2 pb-2 px-0 shadow-sm`}>
        <View className="flex-row items-center justify-between">
          {/* Logo on Absolute Left Corner */}
          <View className="pl-4">
            <Image
              source={require('../assets/images/creco-kenya.png')}
              className="w-40 h-10"
              resizeMode="contain"
            />
          </View>
          
          {/* Profile Image on Absolute Right Corner */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            className={`w-10 h-10 justify-center items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full border ${isDark ? 'border-gray-600' : 'border-gray-200'} mr-4`}>
            {profileLoading ? (
              <ActivityIndicator size="small" color="#0A864D" />
            ) : (
              <Image
                source={profile?.profile_picture ? {uri: profile.profile_picture} : icons.profile}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Separator moved outside header */}
      <View className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`} />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0A864D']}
            tintColor="#0A864D"
          />
        }
      >
        {loading && !refreshing && (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#0A864D" />
          </View>
        )}
        
        {/* Quick Actions - Now with only 2 buttons */}
        <View className="px-6 pt-4">
          <Text className={`text-lg font-psemibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Quick Actions</Text>
          <View className="flex flex-row justify-between gap-3">
            <TouchableOpacity 
              style={{
                backgroundColor: '#0A864D',
                shadowColor: '#0A864D',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              className="flex-1 rounded-2xl p-4"
              onPress={() => navigation.navigate('SubmitClaim')}>
              <Text className="text-white text-center text-sm font-psemibold">Submit Claim</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{
                backgroundColor: '#EF9334',
                shadowColor: '#EF9334',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              className="flex-1 rounded-2xl p-4"
              onPress={() => navigation.navigate('TrendingClaims')}>
              <Text className="text-white text-center text-sm font-psemibold">Trending</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Claims - Redesigned Like Blog Posts */}
        <View className="mt-6 px-6 pb-8">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-psemibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Trending Claims</Text>
            <TouchableOpacity onPress={fetchTrendingClaims}>
              <Text className="text-[#0A864D] font-pmedium text-sm">Refresh</Text>
            </TouchableOpacity>
          </View>
          
          {trendingClaims.map((claim: Claim) => (
            <TouchableOpacity 
              key={claim.id} 
              className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-4 mb-3 shadow-sm border`}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
              onPress={() => handleClaimPress(claim.id)}
            >
              {/* Category & Status - Like Blog Category & Read Time */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View 
                    style={{backgroundColor: '#0A864D'}}
                    className="px-3 py-1 rounded-full"
                  >
                    <Text className="text-white text-xs font-psemibold">
                      {claim.category || 'General'}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-xs font-pregular ml-2">
                    • {claim.category || 'General'}
                  </Text>
                </View>
                <View className="w-2 h-2 bg-gray-300 rounded-full" />
              </View>

              {/* Single Claim Body - Show only description if available, otherwise title */}
              <Text className={`${isDark ? 'text-white' : 'text-gray-900'} font-pbold text-base mb-3 leading-6`}>
                {claim.description || claim.title}
              </Text>

              {/* Status Badge */}
              <View className={`px-3 py-1.5 rounded-full self-start mb-3 ${getStatusColor(claim.status, claim.verdict)}`}>
                <Text className={`text-xs font-psemibold ${getStatusTextColor(claim.status, claim.verdict)}`}>
                  {getStatusLabel(claim.status, claim.verdict)}
                </Text>
              </View>

              {/* Additional Info - Like Blog Author & Date */}
              <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <View className="flex-row items-center">
                  <View className={`w-6 h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mr-2`} />
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-xs font-pmedium`}>
                    {claim.verdictDate 
                      ? `Verified: ${formatDate(claim.verdictDate)}` 
                      : 'Under Review'}
                  </Text>
                </View>
                <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs font-pregular`}>
                  {formatDate(claim.submittedDate || claim.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Empty State for Trending Claims */}
          {trendingClaims.length === 0 && !loading && (
            <View className="items-center justify-center py-8">
              <View className={`w-12 h-12 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full items-center justify-center mb-2`}>
                <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xl`}>🔥</Text>
              </View>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pregular text-xs text-center`}>
                No trending claims{"\n"}
                <Text className={isDark ? 'text-gray-600' : 'text-gray-400'}>Check back later for updates</Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeTab;