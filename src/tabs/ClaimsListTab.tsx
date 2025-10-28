import {View, Text, TouchableOpacity, TextInput, Image, ScrollView, StatusBar, Alert, ActivityIndicator} from 'react-native';
import React, {useState, useEffect} from 'react';
import {icons} from '../constants';
import {ClaimStatus} from '../constants/claimsData';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {claimsService} from '../services/claimsService';
import { useTheme } from '../context/ThemeContext';

type Props = {};

type RootStackParamList = {
  ClaimDetails: { claimId: string };
};

const ClaimsListTab = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | ClaimStatus>('all');
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  useFocusEffect(
    React.useCallback(() => {
      fetchUserClaims();
    }, [])
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date Error';
    }
  };

  const fetchUserClaims = async () => {
    setLoading(true);
    try {
      const data = await claimsService.getUserClaims();
      
      // No need to format dates here - just use the data as is
      setClaims(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  // CORRECTED FILTER LOGIC - Use both status and verdict like display logic
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') {
      return matchesSearch;
    }
    
    // Use both status and verdict for filtering (same logic as display)
    const finalStatus = claim.verdict || claim.status;
    
    switch (selectedFilter) {
      case 'verified':
        // Match verified, true, or resolved status
        return matchesSearch && (
          finalStatus === 'verified' || 
          finalStatus === 'true' || 
          finalStatus === 'resolved'
        );
      case 'false':
        // Match false status
        return matchesSearch && finalStatus === 'false';
      case 'misleading':
        // Match misleading status
        return matchesSearch && finalStatus === 'misleading';
      case 'needs_context':
        // Match needs_context or unverifiable status
        return matchesSearch && (
          finalStatus === 'needs_context' || 
          finalStatus === 'unverifiable'
        );
      case 'pending':
        // Match pending or undefined status
        return matchesSearch && (
          !finalStatus || 
          finalStatus === 'pending'
        );
      default:
        return matchesSearch;
    }
  });

  // CORRECTED: Use both status and verdict like HomeTab
  const getStatusColor = (status: string, verdict?: string): string => {
    const finalStatus = verdict || status;
    
    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
        return 'bg-green-100';
      case 'false':
        return 'bg-red-100';
      case 'misleading':
        return 'bg-orange-100';
      case 'needs_context':
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
      case 'verified':
      case 'resolved':
        return 'text-green-700';
      case 'false':
        return 'text-red-700';
      case 'misleading':
        return 'text-orange-700';
      case 'needs_context':
      case 'unverifiable':
        return 'text-yellow-700';
      default:
        return 'text-gray-700';
    }
  };

  // CORRECTED: Use same logic as HomeTab
  const getStatusLabel = (status: string, verdict?: string): string => {
    // Use verdict if available, otherwise use status
    const finalStatus = verdict || status;
    
    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
        return '✓ True';
      case 'false':
        return '✗ False';
      case 'misleading':
        return '⚠ Misleading';
      case 'needs_context':
      case 'unverifiable':
        return '📋 Needs Context';
      default:
        return '⏳ Pending';
    }
  };

  const handleClaimPress = (claimId: string) => {
    navigation.navigate('ClaimDetails', { claimId });
  };

  // CORRECTED ANALYTICS CALCULATION - Using both status and verdict
  const calculateAnalytics = () => {
    const totalCount = claims.length;
    
    // Count pending claims - using both status and verdict
    const pendingCount = claims.filter(claim => {
      const finalStatus = claim.verdict || claim.status;
      return !finalStatus || finalStatus === 'pending';
    }).length;
    
    // Count verified claims - includes both status 'verified' and verdict 'true' or 'verified'
    const verifiedCount = claims.filter(claim => {
      const finalStatus = claim.verdict || claim.status;
      return finalStatus === 'true' || finalStatus === 'verified' || finalStatus === 'resolved';
    }).length;

    // Count false claims
    const falseCount = claims.filter(claim => {
      const finalStatus = claim.verdict || claim.status;
      return finalStatus === 'false';
    }).length;

    // Count misleading claims
    const misleadingCount = claims.filter(claim => {
      const finalStatus = claim.verdict || claim.status;
      return finalStatus === 'misleading';
    }).length;

    // Count needs context claims
    const needsContextCount = claims.filter(claim => {
      const finalStatus = claim.verdict || claim.status;
      return finalStatus === 'needs_context' || finalStatus === 'unverifiable';
    }).length;

    return {
      totalCount,
      pendingCount,
      verifiedCount,
      falseCount,
      misleadingCount,
      needsContextCount
    };
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
      
      {/* Header removed */}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Overview - Like Featured Banner */}
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
                <Text className="text-white/80 text-xs font-pregular">Pending</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-pbold">{analytics.verifiedCount}</Text>
                <Text className="text-white/80 text-xs font-pregular">Verified</Text>
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

          {/* Updated Search Bar - LineInputField Style with text closer to line */}
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
                {key: 'verified', label: 'Verified'},
                {key: 'false', label: 'False'},
                {key: 'pending', label: 'Pending'},
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

        {/* Claims List - Designed Like Blog Posts */}
        <View className="px-6 pb-8">
          {filteredClaims.map((item) => (
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
              {/* Status & Category - Like Blog Category & Read Time */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View 
                    style={{backgroundColor: '#0A864D'}}
                    className="px-3 py-1 rounded-full"
                  >
                    <Text className="text-white text-xs font-psemibold">
                      {item.category}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-xs font-pregular ml-2">
                    • {formatDate(item.submittedDate || item.created_at || '')}
                  </Text>
                </View>
                <View className="w-2 h-2 bg-gray-300 rounded-full" />
              </View>

              {/* Title - Like Blog Title */}
              <Text className={`${isDark ? 'text-white' : 'text-gray-900'} font-pbold text-base mb-2 leading-5`}>
                {item.title}
              </Text>

              {/* Status Badge - CORRECTED: Use both status and verdict */}
              <View className={`px-3 py-1.5 rounded-full self-start mb-3 ${getStatusColor(item.status, item.verdict)}`}>
                <Text className={`text-xs font-psemibold ${getStatusTextColor(item.status, item.verdict)}`}>
                  {getStatusLabel(item.status, item.verdict)}
                </Text>
              </View>

              {/* Dates - Like Blog Author & Date */}
              <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <View className="flex-row items-center">
                  <View className={`w-6 h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mr-2`} />
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-xs font-pmedium`}>
                    Submitted: {formatDate(item.submittedDate || item.created_at || '')}
                  </Text>
                </View>
                {item.verdictDate && (
                  <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs font-pregular`}>
                    Verdict: {formatDate(item.verdictDate)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Empty State */}
          {filteredClaims.length === 0 && (
            <View className="items-center justify-center py-12">
              <View className={`w-16 h-16 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full items-center justify-center mb-3`}>
                <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-2xl`}>📋</Text>
              </View>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pregular text-sm text-center`}>
                No claims found{"\n"}
                <Text className={isDark ? 'text-gray-600' : 'text-gray-400'}>Try adjusting your search or filters</Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ClaimsListTab;