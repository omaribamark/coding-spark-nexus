import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Linking, TextInput, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { claimsService } from '../services/claimsService';
import { verdictResponseService, VerdictResponse } from '../services/verdictResponseService';
import { RichTextRenderer } from '../components';
import { formatDateTime } from '../utils/dateFormatter';

type ClaimDetailsRouteProps = {
  ClaimDetails: {
    claimId: string;
  };
};

const ClaimDetailsScreen = () => {
  const route = useRoute<RouteProp<ClaimDetailsRouteProps, 'ClaimDetails'>>();
  const navigation = useNavigation();
  const { claimId } = route.params;
  const { isDark } = require('../context/ThemeContext').useTheme();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<VerdictResponse[]>([]);

  useEffect(() => {
    fetchClaimDetails();
    fetchResponses();
  }, [claimId]);

  const fetchResponses = async () => {
    try {
      const responsesData = await verdictResponseService.getClaimResponses(claimId);
      setResponses(responsesData);
    } catch (error: any) {
      console.error('Failed to fetch responses:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (claim && (claim.verdict || claim.verdictText)) {
        claimsService.markVerdictAsRead(claimId);
      }
    }, [claim, claimId])
  );

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
      console.log('Claim details response:', JSON.stringify(claimData, null, 2));
      setClaim(claimData);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch claim details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced link extraction - same as Fact Checker dashboard
  const extractLinks = (claim: any) => {
    console.log('Extracting links from claim:', {
      videoLink: claim.videoLink,
      video_link: claim.video_link,
      video_url: claim.video_url,
      sourceLink: claim.sourceLink,
      source_link: claim.source_link,
      source_url: claim.source_url,
      imageUrl: claim.imageUrl,
      image_url: claim.image_url,
      // Additional fields for verdict images
      verdict_image_url: claim.verdict_image_url,
      evidence_image_url: claim.evidence_image_url
    });

    const videoLink = claim.videoLink || claim.video_link || claim.video_url || '';
    const sourceLink = claim.sourceLink || claim.source_link || claim.source_url || '';
    const imageUrl = claim.imageUrl || claim.image_url || '';
    const verdictImageUrl = claim.verdict_image_url || claim.evidence_image_url || '';

    console.log('Extracted links:', { videoLink, sourceLink, imageUrl, verdictImageUrl });

    return { videoLink, sourceLink, imageUrl, verdictImageUrl };
  };

  const getVerdictStatus = () => {
    if (!claim) return null;

    // First check for human verdict (highest priority)
    if (claim.verdict || claim.verdictText || claim.human_explanation) {
      const finalVerdict = (claim.verdict || 'verified').toLowerCase();
      
      switch (finalVerdict) {
        case 'true':
        case 'verified':
          return {
            color: 'bg-green-50 border-green-200',
            textColor: 'text-green-700',
            icon: '✅',
            label: 'Verified',
            description: 'This claim has been verified as true'
          };
        case 'false':
          return {
            color: 'bg-red-50 border-red-200',
            textColor: 'text-red-700',
            icon: '❌',
            label: 'False',
            description: 'This claim has been verified as false'
          };
        case 'misleading':
          return {
            color: 'bg-orange-50 border-orange-200',
            textColor: 'text-orange-700',
            icon: '⚠️',
            label: 'Misleading',
            description: 'This claim contains misleading information'
          };
        case 'needs_context':
        case 'needs context':
          return {
            color: 'bg-yellow-50 border-yellow-200',
            textColor: 'text-yellow-700',
            icon: '📋',
            label: 'Needs Context',
            description: 'This claim requires additional context'
          };
        default:
          return null;
      }
    }
    
    // Then check for AI verdict
    if (claim.ai_verdict && claim.ai_verdict.explanation) {
      const aiVerdictText = (claim.ai_verdict.verdict || '').toLowerCase();
      const aiExplanation = (claim.ai_verdict.explanation || '').toLowerCase();
      
      console.log('AI Verdict Analysis:', {
        verdictText: aiVerdictText,
        explanation: aiExplanation.substring(0, 100) + '...'
      });

      // Check for explicit "false" verdict first - HIGHEST PRIORITY
      if (aiVerdictText.includes('false') || 
          aiVerdictText.includes('incorrect') || 
          aiVerdictText.includes('not true') ||
          aiVerdictText.includes('inaccurate') ||
          aiVerdictText.includes('untrue') ||
          aiVerdictText.includes('wrong')) {
        return {
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-700',
          icon: '🤖',
          label: 'AI: Likely False',
          description: 'AI analysis indicates this claim appears to be false'
        };
      }
      
      // Check for explicit "true" verdict
      if (aiVerdictText.includes('true') || 
          aiVerdictText.includes('correct') || 
          aiVerdictText.includes('accurate') ||
          aiVerdictText.includes('verified') ||
          aiVerdictText.includes('valid')) {
        return {
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
          icon: '🤖',
          label: 'AI: Likely True',
          description: 'AI analysis indicates this claim appears to be true'
        };
      }
      
      // Check for explicit "misleading" verdict
      if (aiVerdictText.includes('misleading') || 
          aiVerdictText.includes('exaggerat') || 
          aiVerdictText.includes('distort') ||
          aiVerdictText.includes('partial')) {
        return {
          color: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-700',
          icon: '🤖',
          label: 'AI: Misleading',
          description: 'AI analysis indicates this claim may be misleading'
        };
      }
      
      // Check for explicit "needs context" verdict
      if (aiVerdictText.includes('needs context') || 
          aiVerdictText.includes('needs_context') ||
          aiVerdictText.includes('context') ||
          aiVerdictText.includes('additional information') ||
          aiVerdictText.includes('more information') ||
          aiVerdictText.includes('unverifiable')) {
        return {
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-700',
          icon: '🤖',
          label: 'AI: Needs Context',
          description: 'AI analysis indicates more context is needed'
        };
      }
      
      // FALLBACK: Check explanation content for verdict indicators - MORE AGGRESSIVE DETECTION
      const combinedText = aiVerdictText + ' ' + aiExplanation;
      
      // Check for FALSE indicators in explanation (more comprehensive)
      if (combinedText.includes('false') || 
          combinedText.includes('incorrect') || 
          combinedText.includes('not true') ||
          combinedText.includes('inaccurate') ||
          combinedText.includes('untrue') ||
          combinedText.includes('wrong') ||
          combinedText.includes('debunk') ||
          combinedText.includes('disproven') ||
          combinedText.includes('misinformation') ||
          combinedText.includes('no evidence') ||
          combinedText.includes('lack of evidence') ||
          combinedText.includes('contradict') ||
          combinedText.includes('refut')) {
        return {
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-700',
          icon: '🤖',
          label: 'AI: Likely False',
          description: 'AI analysis indicates this claim appears to be false'
        };
      }
      
      // Check for TRUE indicators in explanation
      if (combinedText.includes('true') || 
          combinedText.includes('correct') || 
          combinedText.includes('accurate') ||
          combinedText.includes('verified') ||
          combinedText.includes('valid') ||
          combinedText.includes('supported by') ||
          combinedText.includes('evidence confirms') ||
          combinedText.includes('consistent with') ||
          combinedText.includes('accurate portrayal')) {
        return {
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
          icon: '🤖',
          label: 'AI: Likely True',
          description: 'AI analysis indicates this claim appears to be true'
        };
      }
      
      // Check for MISLEADING indicators in explanation
      if (combinedText.includes('misleading') || 
          combinedText.includes('exaggerat') || 
          combinedText.includes('distort') ||
          combinedText.includes('partial') ||
          combinedText.includes('out of context') ||
          combinedText.includes('oversimplif') ||
          combinedText.includes('misrepresent')) {
        return {
          color: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-700',
          icon: '🤖',
          label: 'AI: Misleading',
          description: 'AI analysis indicates this claim may be misleading'
        };
      }
      
      // FINAL FALLBACK: If no clear verdict is found after comprehensive checking, default to "Needs Context"
      return {
        color: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-700',
        icon: '🤖',
        label: 'AI: Needs Context',
        description: 'AI analysis indicates more context is needed'
      };
    }

    return null;
  };

  const getVerdictExplanation = () => {
    if (claim?.verdictText) return claim.verdictText;
    if (claim?.human_explanation) return claim.human_explanation;
    
    if (claim?.ai_verdict?.explanation) return claim.ai_verdict.explanation;
    
    return 'This claim is currently undergoing thorough review. We will update this page once the verification process is complete.';
  };

  const hasAIVerdict = () => {
    return claim?.ai_verdict && claim?.ai_verdict.explanation && !claim?.ai_verdict?.is_edited_by_human;
  };

  const getVerdictSources = () => {
    if (!claim) return [];
    
    // Use Map with URL as key to prevent duplicates
    const sources = new Map<string, { title: string; url: string }>();
    
    // Extract sources from AI verdict (if not edited by human)
    if (claim.ai_verdict?.sources && Array.isArray(claim.ai_verdict.sources) && !claim.ai_verdict.is_edited_by_human) {
      claim.ai_verdict.sources.forEach((source: any) => {
        const sourceUrl = source.url || source.link || '';
        const sourceTitle = source.title || source.name || 'Source';
        
        if (sourceUrl && sourceUrl.startsWith('http')) {
          sources.set(sourceUrl, { title: sourceTitle, url: sourceUrl });
        }
      });
    }
    
    // Extract from evidence_sources
    if (claim.evidence_sources && Array.isArray(claim.evidence_sources)) {
      claim.evidence_sources.forEach((source: any) => {
        const sourceUrl = source.url || source.link || '';
        const sourceTitle = source.title || source.name || 'Source';
        
        if (sourceUrl && sourceUrl.startsWith('http') && !sources.has(sourceUrl)) {
          sources.set(sourceUrl, { title: sourceTitle, url: sourceUrl });
        }
      });
    }
    
    // Extract from sources
    if (claim.sources && Array.isArray(claim.sources)) {
      claim.sources.forEach((source: any) => {
        const sourceUrl = source.url || source.link || '';
        const sourceTitle = source.title || source.name || 'Source';
        
        if (sourceUrl && sourceUrl.startsWith('http') && !sources.has(sourceUrl)) {
          sources.set(sourceUrl, { title: sourceTitle, url: sourceUrl });
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
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'} justify-center items-center`}>
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-4 font-pmedium`}>Loading claim details...</Text>
      </View>
    );
  }

  if (error && !claim) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'} justify-center items-center p-6`}>
        <Text className="text-red-500 text-lg font-pbold mb-4">Error Loading Claim</Text>
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-center mb-6 font-pregular`}>{error}</Text>
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
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'} justify-center items-center`}>
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-pmedium`}>Claim not found</Text>
        <TouchableOpacity 
          className="bg-[#0A864D] px-6 py-3 rounded-full mt-4"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-psemibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const verdictStatus = getVerdictStatus();
  const verdictSources = getVerdictSources();
  
  // Extract links using the same method as Fact Checker dashboard
  const { videoLink, sourceLink, imageUrl, verdictImageUrl } = extractLinks(claim);

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#FFFFFF"} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {error && (
            <View className={`${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} rounded-lg p-3 mb-6 border`}>
              <Text className={`${isDark ? 'text-yellow-300' : 'text-yellow-700'} font-pmedium text-sm`}>Note: Some data may not load correctly</Text>
              <Text className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'} text-xs mt-1`}>{error}</Text>
            </View>
          )}

          {verdictStatus && (
            <View className={`rounded-xl p-5 mb-6 border-2 ${verdictStatus.color}`}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{verdictStatus.icon}</Text>
                  <View>
                    <Text className={`text-lg font-psemibold ${verdictStatus.textColor}`}>
                      {verdictStatus.label}
                    </Text>
                    <Text className={`text-sm font-pregular ${verdictStatus.textColor} opacity-80`}>
                      {verdictStatus.description}
                    </Text>
                  </View>
                </View>
                <View className={`w-3 h-3 rounded-full ${verdictStatus.textColor.replace('text', 'bg')}`} />
              </View>
              
              {hasAIVerdict() && claim?.ai_verdict?.confidence_score && (
                <View className="mt-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-600 font-pmedium text-xs">
                      AI Confidence Score
                    </Text>
                    <Text className="text-gray-700 font-psemibold text-xs">
                      {Math.round(claim.ai_verdict.confidence_score * 100)}%
                    </Text>
                  </View>
                  <View className="bg-gray-200 rounded-full h-2">
                    <View 
                      className="bg-blue-500 rounded-full h-2" 
                      style={{ width: `${claim.ai_verdict.confidence_score * 100}%` }}
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* CLAIM STATEMENT SECTION */}
          <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-5 mb-6 border`}>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pmedium text-sm mb-3`}>CLAIM STATEMENT</Text>
            <Text className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-pregular text-base leading-6`}>
              {claim.title || 'No title available'}
            </Text>
            
            {claim.description && claim.description !== claim.title && (
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-pregular text-sm leading-5 mt-3`}>
                {claim.description}
              </Text>
            )}
          </View>

          <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-5 mb-6 border`}>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pmedium text-sm mb-3`}>DETAILS</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-pregular`}>Category</Text>
                <Text className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-pmedium`}>
                  {claim.category || 'General'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-pregular`}>Submitted</Text>
                <Text className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-pmedium`}>
                  {formatDate(claim.submittedDate || claim.submitted_date)}
                </Text>
              </View>
              {(claim.verdictDate || claim.updated_at) && (
                <View className="flex-row justify-between">
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-pregular`}>
                    Last Updated
                  </Text>
                  <Text className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-pmedium`}>
                    {formatDate(claim.verdictDate || claim.updated_at)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Display Attached Image - Same style as Fact Checker */}
          {imageUrl && (
            <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-5 mb-6 border`}>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pmedium text-sm mb-3`}>ATTACHED IMAGE</Text>
              <Image
                source={{ uri: imageUrl }}
                className="w-full h-48 rounded-lg"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Video and Source Links - EXACTLY like Fact Checker dashboard */}
          {(videoLink || sourceLink) && (
            <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-5 mb-6 border`}>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pmedium text-sm mb-3`}>USER-PROVIDED LINKS</Text>
              
              {/* Video Link - Same style as Fact Checker */}
              {videoLink && (
                <View className="mb-3">
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-pmedium text-xs mb-1`}>Video Link:</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (videoLink.startsWith('http')) {
                        Linking.openURL(videoLink).catch(() => {
                          Alert.alert('Error', 'Unable to open video link');
                        });
                      }
                    }}>
                    <Text className="text-xs text-blue-600 underline">{videoLink}</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Source Link - Same style as Fact Checker */}
              {sourceLink && (
                <View className="mb-3">
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-pmedium text-xs mb-1`}>Source Link:</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (sourceLink.startsWith('http')) {
                        Linking.openURL(sourceLink).catch(() => {
                          Alert.alert('Error', 'Unable to open source link');
                        });
                      }
                    }}>
                    <Text className="text-xs text-blue-600 underline">{sourceLink}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* FACT CHECK ANALYSIS SECTION WITH CLAIM STATEMENT AND IMAGE */}
          <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-5 mb-6 border`}>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pmedium text-sm mb-3`}>FACT CHECK ANALYSIS</Text>
            
            {hasAIVerdict() && claim?.ai_verdict?.disclaimer && (
              <View className={`${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} rounded-lg p-3 mb-4 border`}>
                <View className="flex-row items-start">
                  <Text className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-lg mr-2`}>🤖</Text>
                  <View className="flex-1">
                    <Text className={`${isDark ? 'text-blue-300' : 'text-blue-800'} font-pmedium text-xs mb-1`}>AI-GENERATED RESPONSE</Text>
                    <Text className={`${isDark ? 'text-blue-200' : 'text-blue-700'} font-pregular text-xs leading-4`}>
                      {claim.ai_verdict.disclaimer}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* CLAIM STATEMENT IN VERDICT SECTION WITH IMAGE */}
            <View className="mb-4">
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pmedium text-sm mb-3`}>CLAIM STATEMENT</Text>
              
              {/* Show the submitted image as part of the claim statement in verdict */}
              {imageUrl && (
                <View className="mb-3">
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-full h-48 rounded-lg"
                    resizeMode="cover"
                  />
                  <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1 italic`}>
                    Image submitted with the claim
                  </Text>
                </View>
              )}
              
              <Text className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-pregular text-base leading-6 mb-2`}>
                {claim.title || 'No title available'}
              </Text>
              
              {claim.description && claim.description !== claim.title && (
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-pregular text-sm leading-5`}>
                  {claim.description}
                </Text>
              )}
            </View>

            <RichTextRenderer 
              text={getVerdictExplanation()} 
              isDark={isDark}
            />

            {/* Display verdict evidence image (only if it's different from the submitted image) */}
            {verdictImageUrl && verdictImageUrl !== imageUrl && (
              <View className="mt-4">
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs font-pmedium mb-2`}>Additional Verdict Evidence</Text>
                <Image 
                  source={{ uri: verdictImageUrl }} 
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
              </View>
            )}
          </View>

          {verdictSources.length > 0 && (
            <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-5 mb-6 border`}>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pmedium text-sm mb-3`}>EVIDENCE SOURCES</Text>
              <View className="space-y-4">
                {verdictSources.map((source: any, index: number) => {
                  const sourceTitle = source.title || 'Source';
                  const sourceUrl = source.url || '';
                  const isClickable = sourceUrl.startsWith('http');
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      className={`p-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border flex-row items-center justify-between`}
                      onPress={() => handleSourcePress(sourceUrl)}
                      disabled={!isClickable}
                    >
                      <View className="flex-1">
                        <Text className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-pmedium text-sm mb-2`}>
                          {sourceTitle}
                        </Text>
                        {sourceUrl && (
                          <Text 
                            className={`font-pregular text-xs ${isClickable ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`} 
                            numberOfLines={2}
                          >
                            {sourceUrl.replace(/^https?:\/\//, '')}
                          </Text>
                        )}
                      </View>
                      {isClickable && (
                        <View className="ml-3 bg-blue-100 p-2 rounded-full">
                          <Text className="text-blue-600 text-xs font-psemibold">↗</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {responses.length > 0 && (
            <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-5 mb-6 border`}>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pmedium text-sm mb-3`}>USER RESPONSES ({responses.length})</Text>
              {responses.map((response, index) => (
                <View 
                  key={response.id} 
                  className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 mb-3`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-pmedium text-sm`}>
                      {response.user.full_name || response.user.username}
                    </Text>
                    <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} font-pregular text-xs`}>
                      {new Date(response.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className={`${isDark ? 'text-gray-200' : 'text-gray-600'} font-pregular text-sm`}>
                    {response.response_text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View className="flex-row space-x-3 mt-8">
            <TouchableOpacity 
              className="flex-1 bg-[#0A864D] rounded-lg py-3"
              onPress={handleRetry}
            >
              <Text className="text-white font-psemibold text-center">Refresh Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg py-3`}
              onPress={() => navigation.goBack()}
            >
              <Text className={`${isDark ? 'text-gray-200' : 'text-gray-700'} font-psemibold text-center`}>Back to List</Text>
            </TouchableOpacity>
          </View>

          <View className={`mt-8 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <Text className={`${isDark ? 'text-gray-500' : 'text-gray-500'} font-pregular text-xs text-center`}>
              Hakikisha Fact-Checking Platform
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ClaimDetailsScreen;