import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { claimsService } from '../services/claimsService';

type ClaimDetailsRouteProps = {
  ClaimDetails: {
    claimId: string;
  };
};

const ClaimDetailsScreen = () => {
  const route = useRoute<RouteProp<ClaimDetailsRouteProps, 'ClaimDetails'>>();
  const navigation = useNavigation();
  const { claimId } = route.params;
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClaimDetails();
  }, [claimId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date Error';
    }
  };

  const fetchClaimDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const claimData = await claimsService.getClaimById(claimId);
      setClaim(claimData);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch claim details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // CORRECTED: Check if claim has been reviewed using same logic as HomeTab
  const isClaimReviewed = () => {
    if (!claim) return false;
    
    // Check if there's a verdict or the status is not pending
    const finalStatus = claim.verdict || claim.status;
    return finalStatus && finalStatus !== 'pending';
  };

  // CORRECTED: Use same logic as HomeTab for verdict status
  const getVerdictStatusConfig = (status: string, verdict?: string) => {
    // Use verdict if available, otherwise use status (same as HomeTab)
    const finalStatus = verdict || status;

    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
        return {
          color: 'bg-green-50',
          textColor: 'text-green-700',
          icon: '✅',
          label: 'True',
        };
      case 'false':
        return {
          color: 'bg-red-50',
          textColor: 'text-red-700',
          icon: '❌',
          label: 'False',
        };
      case 'misleading':
        return {
          color: 'bg-orange-50',
          textColor: 'text-orange-700',
          icon: '⚠️',
          label: 'Misleading',
        };
      case 'needs_context':
      case 'unverifiable':
        return {
          color: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          icon: '📋',
          label: 'Needs Context',
        };
      default:
        return {
          color: 'bg-gray-50',
          textColor: 'text-gray-700',
          icon: '⏳',
          label: 'Under Review',
        };
    }
  };

  const getVerdictExplanation = () => {
    if (claim?.verdictText) return claim.verdictText;
    if (claim?.human_explanation) return claim.human_explanation;
    
    // Fallback explanation based on status (using same logic as HomeTab)
    const finalStatus = claim?.verdict || claim?.status;
    
    switch (finalStatus) {
      case 'true':
      case 'verified':
      case 'resolved':
        return 'Our fact-checking team has verified this claim as true based on comprehensive evidence analysis and reliable sources.';
      case 'false':
        return 'Our fact-checking team has verified this claim as false based on contradictory evidence and reliable sources.';
      case 'misleading':
        return 'This claim contains elements that may mislead readers without proper context or presents information in a distorted manner.';
      case 'needs_context':
      case 'unverifiable':
        return 'Additional context and verification are required to properly assess this claim due to insufficient or ambiguous information.';
      default:
        return 'This claim is currently undergoing thorough review by our fact-checking team. We will update this page once the verification process is complete.';
    }
  };

  // CORRECTED: Remove duplicate evidence sources
  const getVerdictSources = () => {
    if (!claim) return [];
    
    const sources = new Map();
    
    // Process evidence_sources first
    if (claim.evidence_sources && Array.isArray(claim.evidence_sources)) {
      claim.evidence_sources.forEach((source: any) => {
        const sourceUrl = source.url || source.link || '';
        const sourceTitle = source.title || source.name || 'Source';
        const key = sourceUrl || sourceTitle; // Use URL as key if available, otherwise title
        
        if (key && !sources.has(key)) {
          sources.set(key, {
            title: sourceTitle,
            url: sourceUrl
          });
        }
      });
    }
    
    // Process sources, avoiding duplicates
    if (claim.sources && Array.isArray(claim.sources)) {
      claim.sources.forEach((source: any) => {
        const sourceUrl = source.url || source.link || '';
        const sourceTitle = source.title || source.name || 'Source';
        const key = sourceUrl || sourceTitle;
        
        if (key && !sources.has(key)) {
          sources.set(key, {
            title: sourceTitle,
            url: sourceUrl
          });
        }
      });
    }
    
    return Array.from(sources.values());
  };

  const handleRetry = () => {
    fetchClaimDetails();
  };

  const handleSourcePress = (url: string) => {
    if (url && url.startsWith('http')) {
      Linking.openURL(url).catch(err => {
        Alert.alert('Error', 'Unable to open link');
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className="text-gray-600 mt-4 font-pmedium">Loading claim details...</Text>
      </View>
    );
  }

  if (error && !claim) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <Text className="text-red-500 text-lg font-pbold mb-4">Error Loading Claim</Text>
        <Text className="text-gray-600 text-center mb-6 font-pregular">{error}</Text>
        <TouchableOpacity 
          className="bg-[#0A864D] px-6 py-3 rounded-full"
          onPress={handleRetry}
        >
          <Text className="text-white font-psemibold">Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-gray-500 px-6 py-3 rounded-full mt-3"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-psemibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!claim) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600 font-pmedium">Claim not found</Text>
        <TouchableOpacity 
          className="bg-[#0A864D] px-6 py-3 rounded-full mt-4"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-psemibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isReviewed = isClaimReviewed();
  const verdictStatusConfig = getVerdictStatusConfig(claim.status, claim.verdict);
  const verdictSources = getVerdictSources();

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Error Banner */}
          {error && (
            <View className="bg-yellow-50 rounded-lg p-3 mb-6">
              <Text className="text-yellow-700 font-pmedium text-sm">Note: Some data may not load correctly</Text>
              <Text className="text-yellow-600 text-xs mt-1">{error}</Text>
            </View>
          )}

          {/* Status Badge - Now at the top */}
          <View className={`rounded-lg p-3 mb-6 ${verdictStatusConfig.color}`}>
            <View className="flex-row items-center justify-center">
              <Text className="text-xl mr-2">{verdictStatusConfig.icon}</Text>
              <Text className={`text-base font-psemibold ${verdictStatusConfig.textColor}`}>
                {verdictStatusConfig.label}
              </Text>
            </View>
          </View>

          {/* Claim Statement with Border */}
          <View className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
            <Text className="text-gray-500 font-pmedium text-sm mb-3">CLAIM STATEMENT</Text>
            <Text className="text-gray-900 font-pregular text-base leading-6">
              {claim.title || 'No title available'}
            </Text>
            
            {/* Additional description if available */}
            {claim.description && claim.description !== claim.title && (
              <Text className="text-gray-600 font-pregular text-sm leading-5 mt-3">
                {claim.description}
              </Text>
            )}
          </View>

          {/* Details with Border */}
          <View className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
            <Text className="text-gray-500 font-pmedium text-sm mb-3">DETAILS</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-700 font-pregular">Category</Text>
                <Text className="text-gray-900 font-pmedium">
                  {claim.category || 'General'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700 font-pregular">Submitted</Text>
                <Text className="text-gray-900 font-pmedium">
                  {formatDate(claim.submittedDate || claim.submitted_date)}
                </Text>
              </View>
              {(claim.verdictDate || claim.updated_at) && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-700 font-pregular">
                    {isReviewed ? 'Verdict Date' : 'Last Updated'}
                  </Text>
                  <Text className="text-gray-900 font-pmedium">
                    {formatDate(claim.verdictDate || claim.updated_at)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Fact-Check Analysis with Border */}
          <View className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
            <Text className="text-gray-500 font-pmedium text-sm mb-3">FACT-CHECK ANALYSIS</Text>
            <Text className="text-gray-700 font-pregular text-base leading-6">
              {getVerdictExplanation()}
            </Text>
          </View>

          {/* Evidence Sources with Border - No duplicates */}
          {verdictSources.length > 0 && (
            <View className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
              <Text className="text-gray-500 font-pmedium text-sm mb-3">EVIDENCE SOURCES</Text>
              <View className="space-y-3">
                {verdictSources.map((source: any, index: number) => {
                  const sourceTitle = source.title || 'Source';
                  const sourceUrl = source.url || '';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      className="py-3 border-b border-gray-200 flex-row items-center"
                      onPress={() => handleSourcePress(sourceUrl)}
                      disabled={!sourceUrl.startsWith('http')}
                    >
                      <View className="flex-1">
                        <Text className="text-gray-900 font-pmedium text-sm mb-1">
                          {sourceTitle}
                        </Text>
                        {sourceUrl && (
                          <Text className="text-blue-600 font-pregular text-xs" numberOfLines={1}>
                            {sourceUrl.replace(/^https?:\/\//, '')}
                          </Text>
                        )}
                      </View>
                      {sourceUrl.startsWith('http') && (
                        <Text className="text-blue-500 text-lg ml-2">↗</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mt-8">
            <TouchableOpacity 
              className="flex-1 bg-[#0A864D] rounded-lg py-3"
              onPress={handleRetry}
            >
              <Text className="text-white font-psemibold text-center">Refresh Details</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-gray-100 rounded-lg py-3"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-gray-700 font-psemibold text-center">Back to List</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <View className="mt-8 pt-6 border-t border-gray-200">
            <Text className="text-gray-500 font-pregular text-xs text-center">
              Hakikisha Fact-Checking Platform
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ClaimDetailsScreen;