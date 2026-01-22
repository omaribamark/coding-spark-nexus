import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { icons } from '@/constants';
import { claimsService } from '@/services/claimsService';
import { useTheme } from '@/context/ThemeContext';

const ClaimsListTab = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  useFocusEffect(
    useCallback(() => {
      fetchUserClaims();
    }, [])
  );

  const fetchUserClaims = async () => {
    setLoading(true);
    try {
      const data = await claimsService.getUserClaims();
      setClaims(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const isClaimVerified = (claim: any): boolean => {
    return (
      claim.status === 'verified' || 
      claim.status === 'true' || 
      claim.status === 'ai_verified' ||
      claim.status === 'completed' ||
      claim.verdict === 'true' ||
      claim.verdict === 'verified' ||
      (claim.ai_verdict && claim.ai_verdict.explanation) ||
      claim.verdictText ||
      claim.human_explanation ||
      claim.final_verdict
    );
  };

  const isClaimPending = (claim: any): boolean => {
    return (
      claim.status === 'pending' ||
      !claim.status ||
      (!claim.verdict && !claim.ai_verdict && !claim.human_explanation && !claim.verdictText && !claim.final_verdict)
    );
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         claim.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'all':
        return true;
      case 'verified':
        return isClaimVerified(claim);
      case 'pending':
        return isClaimPending(claim);
      default:
        return true;
    }
  });

  const getFinalStatus = (claim: any): { isVerified: boolean; isAI: boolean; isHuman: boolean } => {
    const isVerified = isClaimVerified(claim);
    const hasAIVerdict = !!(claim.ai_verdict && claim.ai_verdict.explanation);
    const hasHumanVerdict = !!(claim.verdict || claim.verdictText || claim.human_explanation);
    
    return {
      isVerified,
      isAI: isVerified && hasAIVerdict && !hasHumanVerdict,
      isHuman: isVerified && hasHumanVerdict
    };
  };

  const getVerificationText = (claim: any): string => {
    const { isAI, isHuman } = getFinalStatus(claim);
    
    if (isHuman) return 'Human Reviewed';
    if (isAI) return 'AI Reviewed';
    return 'Waiting Human Review';
  };

  const handleClaimPress = (claimId: string) => {
    router.push(`/claim-details?claimId=${claimId}`);
  };

  const calculateAnalytics = () => {
    const totalCount = claims.length;
    const pendingCount = claims.filter(claim => isClaimPending(claim)).length;
    const verifiedCount = claims.filter(claim => isClaimVerified(claim)).length;

    return { totalCount, pendingCount, verifiedCount };
  };

  const formatDateTimeWithoutTimezone = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          if (diffMinutes <= 1) return 'Just now';
          return `${diffMinutes}m ago`;
        }
        if (diffHours < 6) return `${diffHours}h ago`;
      }
      
      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      
      if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      }
      
      if (diffDays < 7) {
        return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      }
      
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } catch (error) {
      return '';
    }
  };

  const analytics = calculateAnalytics();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0A864D" />
        <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563', marginTop: 16 }}>Loading claims...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff' }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#FFFFFF"} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
          <View style={{ backgroundColor: '#0A864D', borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>📈 Overview</Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' }}>Active</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8, lineHeight: 24 }}>Claim Analytics</Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 16, lineHeight: 20 }}>Monitor your fact-checking submissions and their status</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{analytics.totalCount}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Total</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{analytics.pendingCount}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Human Pending</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{analytics.verifiedCount}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>AI Reviewed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Search & Filters */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#fff' : '#111827' }}>Your Claims</Text>
            <TouchableOpacity>
              <Text style={{ color: '#0A864D', fontWeight: '500', fontSize: 14 }}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: isDark ? '#D1D5DB' : '#111827', fontWeight: '500', fontSize: 14, marginBottom: 4 }}>Search Claims</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Search your claims..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  color: isDark ? '#F3F4F6' : '#111827',
                  fontSize: 14,
                  paddingVertical: 4,
                  borderBottomWidth: focusedField === 'search' ? 2 : 1,
                  borderBottomColor: focusedField === 'search' ? '#0A864D' : isDark ? '#4B5563' : '#D1D5DB',
                }}
                placeholderTextColor={isDark ? "#6B7280" : "#999"}
                onFocus={() => setFocusedField('search')}
                onBlur={() => setFocusedField(null)}
              />
              <View style={{ position: 'absolute', right: 0, top: 4 }}>
                {searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 18 }}>×</Text>
                  </TouchableOpacity>
                ) : (
                  <Image source={icons.search} style={{ width: 16, height: 16, tintColor: isDark ? '#9CA3AF' : '#666' }} resizeMode="contain" />
                )}
              </View>
            </View>
          </View>

          {/* Filter Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 12, padding: 4 }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'verified', label: 'Reviewed' },
                { key: 'pending', label: 'Human Pending' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setSelectedFilter(item.key as any)}
                  style={{
                    backgroundColor: selectedFilter === item.key ? '#0A864D' : 'transparent',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginHorizontal: 4,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: selectedFilter === item.key ? '#fff' : isDark ? '#D1D5DB' : '#374151' }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Claims List */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          {filteredClaims.map((item) => (
            <TouchableOpacity 
              key={item.id}
              onPress={() => handleClaimPress(item.id)}
              style={{
                backgroundColor: isDark ? '#1F2937' : '#fff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#F3F4F6',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ backgroundColor: '#0A864D', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{item.category || 'General'}</Text>
                </View>
              </View>

              <Text style={{ color: isDark ? '#fff' : '#111827', fontWeight: '700', fontSize: 16, marginBottom: 12, lineHeight: 24 }}>
                {item.description || item.title}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 24, height: 24, backgroundColor: isDark ? '#374151' : '#E5E7EB', borderRadius: 12, marginRight: 8 }} />
                  <Text style={{ color: isDark ? '#D1D5DB' : '#374151', fontSize: 12, fontWeight: '500' }}>{getVerificationText(item)}</Text>
                </View>
                <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 12 }}>
                  {formatDateTimeWithoutTimezone(item.submittedDate || item.created_at || '')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Empty State */}
          {filteredClaims.length === 0 && (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
              <View style={{ width: 64, height: 64, backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 24 }}>
                  {selectedFilter === 'verified' ? '✅' : selectedFilter === 'pending' ? '⏳' : '📝'}
                </Text>
              </View>
              <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
                {selectedFilter === 'verified' ? 'No reviewed claims found' :
                 selectedFilter === 'pending' ? 'No human pending claims found' : 'No claims found'}
              </Text>
              <Text style={{ color: isDark ? '#4B5563' : '#9CA3AF', fontSize: 12, textAlign: 'center' }}>
                {selectedFilter === 'verified' ? 'Claims reviewed by AI or human will appear here' :
                 selectedFilter === 'pending' ? 'Claims awaiting human review will appear here' :
                 'Try adjusting your search or create a new claim'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ClaimsListTab;
