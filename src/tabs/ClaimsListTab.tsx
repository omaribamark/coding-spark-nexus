import {View, Text, TouchableOpacity, TextInput, Image, ScrollView, StatusBar, Alert, ActivityIndicator} from 'react-native';
import React, {useState, useEffect} from 'react';
import {icons} from '../constants';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {claimsService} from '../services/claimsService';
import { useTheme } from '../context/ThemeContext';
import { formatDateTime } from '../utils/dateFormatter';

type Props = {};

type RootStackParamList = {
  ClaimDetails: { claimId: string };
};

const ClaimsListTab = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  useFocusEffect(
    React.useCallback(() => {
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

  // HELPER FUNCTIONS
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

  // FILTER LOGIC
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

  // STATUS DETECTION
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

  // VERIFICATION TEXT
  const getVerificationText = (claim: any): string => {
    const { isVerified, isAI, isHuman } = getFinalStatus(claim);
    
    if (isHuman) {
      return 'Human Reviewed';
    }
    
    if (isAI) {
      return ' AI Reviewed';
    }
    
    // Pending claims
    return 'Waiting Human Review';
  };

  const handleClaimPress = (claimId: string) => {
    navigation.navigate('ClaimDetails', { claimId });
  };

  // ANALYTICS CALCULATION
  const calculateAnalytics = () => {
    const totalCount = claims.length;
    const pendingCount = claims.filter(claim => isClaimPending(claim)).length;
    const verifiedCount = claims.filter(claim => isClaimVerified(claim)).length;

    return {
      totalCount,
      pendingCount,
      verifiedCount
    };
  };

  // FORMAT DATE AND TIME WITHOUT TIMEZONE
  const formatDateTimeWithoutTimezone = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If within 24 hours, show relative time with exact time
      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          if (diffMinutes <= 1) return 'Just now';
          return `${diffMinutes}m ago`;
        }
        if (diffHours < 6) {
          return `${diffHours}h ago`;
        }
      }
      
      // For today but more than 6 hours ago, show time
      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      
      // For yesterday, show "Yesterday" with time
      if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}`;
      }
      
      // For within 7 days, show day name with time
      if (diffDays < 7) {
        return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}`;
      }
      
      // For older dates, show date with time
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })}, ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}`;
    } catch (error) {
      return '';
    }
  };

  const analytics = calculateAnalytics();

  if (loading) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'} items-center justify-center`}>
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-4 font-pregular`}>Loading claims...</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#FFFFFF"} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View className="px-6 py-5">
          <View 
            style={{
              backgroundColor: '#0A864D',
              shadowColor: '#0A864D',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
            className="rounded-2xl p-5"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-pbold">📈 Overview</Text>
              </View>
              <Text className="text-white/80 text-xs font-pmedium">Active</Text>
            </View>
            <Text className="text-white text-xl font-pbold mb-2 leading-6">
              Claim Analytics
            </Text>
            <Text className="text-white/90 font-pregular text-sm mb-4 leading-5">
              Monitor your fact-checking submissions and their status
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-lg font-pbold">{analytics.totalCount}</Text>
                <Text className="text-white/80 text-xs font-pregular">Total</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-pbold">{analytics.pendingCount}</Text>
                <Text className="text-white/80 text-xs font-pregular">Human Pending</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-pbold">{analytics.verifiedCount}</Text>
                <Text className="text-white/80 text-xs font-pregular">AI Reviewed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Search & Filters */}
        <View className="px-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-lg font-psemibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Claims
            </Text>
            <TouchableOpacity>
              <Text className="text-[#0A864D] font-pmedium text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="mb-4">
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-900'} font-pmedium text-sm mb-1`}>
              Search Claims
            </Text>
            <View className="relative">
              <TextInput
                placeholder="Search your claims..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-pregular text-sm py-1 border-b ${
                  focusedField === 'search' ? 'border-[#0A864D]' : isDark ? 'border-gray-600' : 'border-gray-300'
                }`}
                placeholderTextColor={isDark ? "#6B7280" : "#999"}
                onFocus={() => setFocusedField('search')}
                onBlur={() => setFocusedField(null)}
              />
              <View className="absolute right-0 top-1">
                {searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-lg`}>×</Text>
                  </TouchableOpacity>
                ) : (
                  <Image 
                    source={icons.search} 
                    className="w-4 h-4" 
                    resizeMode="contain" 
                    tintColor={isDark ? "#9CA3AF" : "#666"}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Centered Filter Buttons */}
          <View className="flex-row justify-center mb-4">
            <View className={`flex-row ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-1`}>
              {[
                {key: 'all', label: 'All'},
                {key: 'verified', label: 'Reviewed'},
                {key: 'pending', label: 'Human Pending'},
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setSelectedFilter(item.key as any)}
                  style={{
                    backgroundColor: selectedFilter === item.key ? '#0A864D' : 'transparent',
                  }}
                  className="px-4 py-2 rounded-lg mx-1"
                >
                  <Text
                    className={`text-sm font-pmedium ${
                      selectedFilter === item.key ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Claims List */}
        <View className="px-6 pb-8">
          {filteredClaims.map((item) => {
            const { isVerified } = getFinalStatus(item);
            
            return (
              <TouchableOpacity 
                key={item.id}
                onPress={() => handleClaimPress(item.id)}
                className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-4 mb-3 shadow-sm border`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                {/* Category Badge Only */}
                <View className="flex-row items-center justify-between mb-3">
                  <View 
                    style={{backgroundColor: '#0A864D'}}
                    className="px-3 py-1 rounded-full"
                  >
                    <Text className="text-white text-xs font-psemibold">
                      {item.category || 'General'}
                    </Text>
                  </View>
                </View>

                {/* Claim Body */}
                <Text className={`${isDark ? 'text-white' : 'text-gray-900'} font-pbold text-base mb-3 leading-6`}>
                  {item.description || item.title}
                </Text>

                {/* Additional Info - Status and Submission Time */}
                <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <View className="flex-row items-center">
                    <View className={`w-6 h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mr-2`} />
                    <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-xs font-pmedium`}>
                      {getVerificationText(item)}
                    </Text>
                  </View>
                  <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs font-pregular`}>
                    {formatDateTimeWithoutTimezone(item.submittedDate || item.created_at || '')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          
          {/* Empty State */}
          {filteredClaims.length === 0 && (
            <View className="items-center justify-center py-12">
              <View className={`w-16 h-16 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full items-center justify-center mb-3`}>
                <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-2xl`}>
                  {selectedFilter === 'verified' ? '✅' :
                   selectedFilter === 'pending' }
                </Text>
              </View>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pregular text-sm text-center mb-2`}>
                {selectedFilter === 'verified'
                  ? 'No reviewed claims found'
                  : selectedFilter === 'pending'
                  ? 'No human pending claims found'
                  : 'No claims found'
                }
              </Text>
              <Text className={`${isDark ? 'text-gray-600' : 'text-gray-400'} font-pregular text-xs text-center`}>
                {selectedFilter === 'verified'
                  ? 'Claims reviewed by AI or human will appear here'
                  : selectedFilter === 'pending'
                  ? 'Claims awaiting human review will appear here'
                  : 'Try adjusting your search or create a new claim'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ClaimsListTab;