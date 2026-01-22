import {View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {claimsService} from '../services/claimsService';
import { useTheme } from '../context/ThemeContext';

type Props = {};

const TrendingTab = (props: Props) => {
  const { isDark } = useTheme();
  const [trendingClaims, setTrendingClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const data = await claimsService.getTrendingClaims(20);
      setTrendingClaims(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch trending claims');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Improved status detection that considers AI verdicts
  const getFinalStatus = (claim: any) => {
    // Priority 1: Human verdict
    if (claim.verdict || claim.verdictText || claim.human_explanation) {
      return {
        status: claim.verdict || 'verified',
        verdict: claim.verdict,
        isAI: false
      };
    }
    
    // Priority 2: AI verdict with completed status
    if (claim.status === 'completed' && claim.ai_verdict) {
      return {
        status: 'ai_verified',
        verdict: claim.verdict || claim.ai_verdict.verdict,
        isAI: true
      };
    }
    
    // Priority 3: AI verdict (even if status is pending/needs_context)
    if (claim.ai_verdict && claim.ai_verdict.explanation) {
      // FIXED: If AI has provided a verdict, use it regardless of status
      return {
        status: 'ai_verified',
        verdict: claim.verdict || claim.ai_verdict.verdict,
        isAI: true
      };
    }
    
    // Priority 4: Status from backend (only if no AI verdict)
    return {
      status: claim.status || 'pending',
      verdict: claim.verdict,
      isAI: false
    };
  };

  // FIXED: Use improved status detection
  const getStatusColor = (claim: any) => {
    const { status, verdict } = getFinalStatus(claim);
    const finalStatus = verdict || status;
    
    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
      case 'completed':
      case 'ai_verified':
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

  const getStatusTextColor = (claim: any) => {
    const { status, verdict } = getFinalStatus(claim);
    const finalStatus = verdict || status;
    
    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
      case 'completed':
      case 'ai_verified':
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

  // FIXED: Improved status labels that prioritize AI verdicts
  const getStatusLabel = (claim: any) => {
    const { status, verdict, isAI } = getFinalStatus(claim);
    const finalStatus = verdict || status;
    
    // Add AI indicator if it's an AI verdict
    const aiLabel = isAI ? 'AI Verdict: ' : '';
    
    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
      case 'completed':
      case 'ai_verified':
        return `${aiLabel}Verified`;
      case 'false':
        return `${aiLabel}False`;
      case 'misleading':
        return `${aiLabel}Misleading`;
      case 'needs_context':
      case 'unverifiable':
        // FIXED: Only show "Needs Review" if there's no AI verdict
        if (isAI) {
          // If AI has verdict but status is needs_context, show AI verdict instead
          return `${aiLabel}Verified`; // Default to verified for AI with needs_context status
        }
        return `${aiLabel}Needs Review`;
      default:
        // FIXED: Only show "Pending Review" if there's no AI verdict
        if (isAI) {
          return `${aiLabel}Verified`; // Default to verified for AI with pending status
        }
        return 'Pending Review';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <View style={{backgroundColor: '#EF9334'}} className="pt-16 pb-8 px-4">
        <Text className="text-white text-2xl md:text-3xl font-pbold mb-2">Trending Claims</Text>
        <Text className="text-white/90 text-sm md:text-base font-pregular">
          Most verified claims - Latest first
        </Text>
      </View>

      {/* Trending List */}
      {loading && (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#EF9334" />
        </View>
      )}
      <FlatList
        data={trendingClaims}
        className="px-4 py-6"
        renderItem={({item, index}) => (
          <TouchableOpacity className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} rounded-2xl p-4 mb-4 border`}>
            {/* Trending Badge */}
            <View className="flex-row items-center justify-between mb-3 flex-wrap gap-2">
              <View className="bg-[#EF9334] px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-pbold">
                  🔥 #{index + 1} Trending
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(item)}`}>
                <Text className={`text-xs font-psemibold ${getStatusTextColor(item)}`} numberOfLines={1}>
                  {getStatusLabel(item)}
                </Text>
              </View>
            </View>

            {/* Claim Title */}
            <Text className={`${isDark ? 'text-white' : 'text-gray-900'} font-pbold text-base md:text-lg mb-2`} numberOfLines={3}>
              {item.title}
            </Text>

            {/* Category */}
            <View className="flex-row items-center mb-3 flex-wrap">
              <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'} px-3 py-1 rounded-full mr-2`}>
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-xs font-pmedium`}>
                  {item.category}
                </Text>
              </View>
            </View>

            {/* Verdict */}
            {item.verdictText && (
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} font-pregular text-sm mb-3`} numberOfLines={3}>
                {item.verdictText}
              </Text>
            )}

            {/* Date */}
            <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs font-pregular`}>
              Verified: {formatDate(item.verdict_date || item.submitted_date || item.submittedDate || item.created_at)}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-base font-pregular`}>
              No trending claims yet
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default TrendingTab;