import React, { useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { icons } from '@/constants';
import { claimsService, Claim } from '@/services/claimsService';
import { userService } from '@/services/userService';
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

const HomeTab = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
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
    await Promise.all([fetchTrendingClaims(), fetchUserProfile()]);
    setRefreshing(false);
  };

  const getVerdictType = (claim: any): { isAI: boolean; isHuman: boolean } => {
    const hasAIVerdict = claim.ai_verdict && (claim.ai_verdict.explanation || claim.ai_verdict.verdict);
    const hasHumanReview = claim.fact_checker || claim.human_explanation || claim.verdictDate;
    
    if (hasHumanReview) {
      return { isAI: false, isHuman: true };
    }
    
    if (hasAIVerdict) {
      return { isAI: true, isHuman: false };
    }
    
    return { isAI: true, isHuman: false };
  };

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

  const getStatusColor = (claim: any) => {
    const { verdict } = getFinalStatus(claim);
    const finalStatus = verdict || claim.status;
    
    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
      case 'completed':
      case 'ai_verified':
        return '#0A864D';
      case 'false':
        return '#dc2626';
      case 'misleading':
        return '#EF9334';
      case 'needs_context':
      case 'unverifiable':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (claim: any) => {
    const { verdict, isAI } = getFinalStatus(claim);
    const finalStatus = verdict || claim.status;
    
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
        return 'AI Verdict';
    }
  };

  const getVerdictTypeLabel = (claim: any) => {
    const { isHuman } = getVerdictType(claim);
    return isHuman ? 'Human Verdict' : 'AI Verdict';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Date unavailable';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date error';
    }
  };

  const handleClaimPress = (claimId: string): void => {
    router.push(`/claim-details?claimId=${claimId}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff', paddingTop: insets.top }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#FFFFFF"} translucent />
      
      {/* Header */}
      <View style={{ backgroundColor: isDark ? '#1F2937' : '#fff', paddingVertical: 8, paddingHorizontal: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Image
          source={require('@/assets/images/logowithnobackground.png')}
          style={{ width: 112, height: 48 }}
          resizeMode="contain"
        />
        
        <TouchableOpacity 
          onPress={() => router.push('/profile')}
          style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 20, marginRight: 16 }}>
          {profileLoading ? (
            <ActivityIndicator size="small" color="#0A864D" />
          ) : (
            <Image
              source={profile?.profile_picture ? { uri: profile.profile_picture } : icons.profile}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#F3F4F6' }} />

      <ScrollView 
        style={{ flex: 1 }} 
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
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0A864D" />
          </View>
        )}
        
        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#fff' : '#111827', marginBottom: 16 }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <TouchableOpacity 
              style={{
                backgroundColor: '#0A864D',
                flex: 1,
                borderRadius: 16,
                padding: 16,
              }}
              onPress={() => router.push('/submit-claim')}>
              <Text style={{ color: '#fff', textAlign: 'center', fontSize: 14, fontWeight: '600' }}>Submit Claim</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{
                backgroundColor: '#EF9334',
                flex: 1,
                borderRadius: 16,
                padding: 16,
              }}
              onPress={() => router.push('/trending-claims')}>
              <Text style={{ color: '#fff', textAlign: 'center', fontSize: 14, fontWeight: '600' }}>Trending</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Latest Community Claims */}
        <View style={{ marginTop: 24, paddingHorizontal: 24, paddingBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#fff' : '#111827' }}>Latest Community Claims</Text>
            <TouchableOpacity onPress={fetchTrendingClaims}>
              <Text style={{ color: '#0A864D', fontWeight: '500', fontSize: 14 }}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          {trendingClaims.map((claim: Claim) => (
            <TouchableOpacity 
              key={claim.id} 
              style={{
                backgroundColor: isDark ? '#1F2937' : '#fff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#F3F4F6',
              }}
              onPress={() => handleClaimPress(claim.id)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ backgroundColor: '#EF9334', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                    {claim.category || 'General'}
                  </Text>
                </View>
                <View style={{ backgroundColor: getStatusColor(claim), paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                    {getStatusLabel(claim)}
                  </Text>
                </View>
              </View>

              <Text style={{ color: isDark ? '#fff' : '#111827', fontWeight: '700', fontSize: 16, marginBottom: 12, lineHeight: 24 }}>
                {claim.description || claim.title}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6' }}>
                <Text style={{ color: isDark ? '#D1D5DB' : '#374151', fontSize: 12, fontWeight: '500' }}>
                  {getVerdictTypeLabel(claim)}
                </Text>
                <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 12 }}>
                  Submitted: {formatDate(claim.submittedDate || claim.created_at)}
                </Text>
              </View>

              {claim.fact_checker && (
                <View style={{ marginTop: 8, backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' }}>
                  <Text style={{ color: '#1D4ED8', fontSize: 12, fontWeight: '600' }}>
                    Reviewed by Creco Fact Checker
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          {trendingClaims.length === 0 && !loading && (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
              <View style={{ width: 48, height: 48, backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 20 }}>🔥</Text>
              </View>
              <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12, textAlign: 'center' }}>
                No community claims found{"\n"}
                <Text style={{ color: isDark ? '#4B5563' : '#9CA3AF' }}>Be the first to submit a claim</Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeTab;
