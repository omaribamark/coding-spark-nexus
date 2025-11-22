import {
  View,
  Text,
  Image,
  TouchableOpacity,
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
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTrendingClaims();
    fetchUserProfile();
    fetchRecentClaims();
  }, []);

  const fetchTrendingClaims = async (): Promise<void> => {
    try {
      setLoading(true);
      const trendingData = await claimsService.getTrendingClaims(20);
      
      const sortedClaims = trendingData.sort((a: Claim, b: Claim) => 
        new Date(b.submittedDate || b.created_at || '').getTime() - 
        new Date(a.submittedDate || a.created_at || '').getTime()
      ).slice(0, 10);
      
      setTrendingClaims(sortedClaims);
    } catch (error: any) {
      console.error('Fetch trending claims error:', error);
      Alert.alert('Error', 'Failed to fetch community claims');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentClaims = async (): Promise<void> => {
    try {
      const data = await claimsService.getUserClaims();
      const sortedClaims = data.sort((a: Claim, b: Claim) => 
        new Date(b.submittedDate || b.created_at || '').getTime() - 
        new Date(a.submittedDate || a.created_at || '').getTime()
      ).slice(0, 5);
      setRecentClaims(sortedClaims);
    } catch (error: any) {
      console.error('Fetch recent claims error:', error);
    }
  };

  const fetchUserProfile = async (): Promise<void> => {
    try {
      setProfileLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([fetchTrendingClaims(), fetchUserProfile(), fetchRecentClaims()]);
    setRefreshing(false);
  };

  // ✅ CORRECTED: Proper AI vs Human verdict detection
  const getVerdictType = (claim: any): { isAI: boolean; isHuman: boolean } => {
    const hasAIVerdict = claim.ai_verdict && (claim.ai_verdict.explanation || claim.ai_verdict.verdict);
    const hasHumanReview = claim.fact_checker || claim.human_explanation || claim.verdictDate;
    
    // If there's explicit human review, it's human verdict
    if (hasHumanReview) {
      return { isAI: false, isHuman: true };
    }
    
    // If there's AI verdict but no human review, it's AI verdict
    if (hasAIVerdict) {
      return { isAI: true, isHuman: false };
    }
    
    // Default to AI Verdict (changed from pending)
    return { isAI: true, isHuman: false };
  };

  // ✅ CORRECTED: Status detection
  const getFinalStatus = (claim: any) => {
    const { isAI, isHuman } = getVerdictType(claim);
    
    if (isHuman) {
      return {
        status: claim.verdict || 'verified',
        verdict: claim.verdict,
        isAI: false,
        isHuman: true
      };
    }
    
    if (isAI) {
      return {
        status: 'ai_verified',
        verdict: claim.verdict || claim.ai_verdict?.verdict,
        isAI: true,
        isHuman: false
      };
    }
    
    return {
      status: claim.status || 'ai_verified',
      verdict: claim.verdict,
      isAI: true,
      isHuman: false
    };
  };

  // ✅ UPDATED: Use improved status detection
  const getStatusColor = (claim: any) => {
    const { status, verdict } = getFinalStatus(claim);
    const finalStatus = verdict || status;
    
    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
      case 'completed':
      case 'ai_verified':
        return '#0A864D'; // Green
      case 'false':
        return '#dc2626'; // Red
      case 'misleading':
        return '#EF9334'; // Orange
      case 'needs_context':
      case 'unverifiable':
        return '#3b82f6'; // Blue
      default:
        return '#6b7280'; // Gray
    }
  };

  // ✅ CORRECTED: Status labels with proper AI/Human distinction
  const getStatusLabel = (claim: any) => {
    const { status, verdict, isAI } = getFinalStatus(claim);
    const finalStatus = verdict || status;
    
    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
      case 'completed':
      case 'ai_verified':
        return isAI ? 'AI: True' : 'True';
      case 'false':
        return isAI ? 'AI: False' : 'False';
      case 'misleading':
        return isAI ? 'AI: Misleading' : 'Misleading';
      case 'needs_context':
      case 'unverifiable':
        return isAI ? 'AI: Needs Context' : 'Needs Context';
      default:
        return 'AI Verdict'; // Changed from 'Pending Review'
    }
  };

  // ✅ UPDATED: Verdict type label - All verdicts are now AI Verdict
  const getVerdictTypeLabel = (claim: any) => {
    const { isAI, isHuman } = getVerdictType(claim);
    
    if (isHuman) {
      return 'Human Verdict';
    }
    
    // All other cases return AI Verdict
    return 'AI Verdict';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Date unavailable';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
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
          {/* Logo on Absolute Left Corner - INCREASED SIZE AND MOVED LEFT */}
          <View >
            <Image
              source={require('../assets/images/logowithnobackground.png')}
              className="w-28 h-12" // Increased from w-40 h-10 to w-48 h-12
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


        {/* Latest Community Claims - Redesigned Like Blog Posts */}
        <View className="mt-6 px-6 pb-8">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-psemibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Latest Community Claims</Text>
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
              {/* Category and Status Badges */}
              <View className="flex-row items-center justify-between mb-3">
                <View 
                  style={{backgroundColor: '#EF9334'}}
                  className="px-3 py-1 rounded-full"
                >
                  <Text className="text-white text-xs font-psemibold">
                    {claim.category || 'General'}
                  </Text>
                </View>
                {/* ✅ UPDATED: Status Badge with AI Verdict labels */}
                <View
                  className="px-3 py-1 rounded-full"
                  style={{backgroundColor: getStatusColor(claim)}}
                >
                  <Text className="text-white text-xs font-psemibold">
                    {getStatusLabel(claim)}
                  </Text>
                </View>
              </View>

              {/* Single Claim Body - Show only description if available, otherwise title */}
              <Text className={`${isDark ? 'text-white' : 'text-gray-900'} font-pbold text-base mb-3 leading-6`}>
                {claim.description || claim.title}
              </Text>

              {/* Additional Info - Shows verdict type and submission date */}
              <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <View className="flex-row items-center">
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-xs font-pmedium`}>
                    {getVerdictTypeLabel(claim)}
                  </Text>
                </View>
                <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs font-pregular`}>
                  Submitted: {formatDate(claim.submittedDate || claim.created_at)}
                </Text>
              </View>

              {/* Creco Fact Checker Badge - Show if edited by Creco */}
              {(claim.fact_checker !== undefined && claim.fact_checker !== null) && (
                <View className="mt-2 px-3 py-1 bg-blue-100 rounded-full self-start">
                  <Text className="text-blue-700 text-xs font-psemibold">
                    👨Reviewed by Creco Fact Checker
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          {/* Empty State for Trending Claims */}
          {trendingClaims.length === 0 && !loading && (
            <View className="items-center justify-center py-8">
              <View className={`w-12 h-12 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full items-center justify-center mb-2`}>
                <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xl`}>🔥</Text>
              </View>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pregular text-xs text-center`}>
                No community claims found{"\n"}
                <Text className={isDark ? 'text-gray-600' : 'text-gray-400'}>Be the first to submit a claim</Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeTab;