import {View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Linking, TextInput, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useRoute, RouteProp, useNavigation, useFocusEffect} from '@react-navigation/native';
import {claimsService} from '../services/claimsService';
import {verdictResponseService, VerdictResponse} from '../services/verdictResponseService';
import {RichTextRenderer} from '../components';
import {formatDateTime} from '../utils/dateFormatter';

type ClaimDetailsRouteProps = {
  ClaimDetails: {
    claimId: string;
  };
};

const ClaimDetailsScreen = () => {
  const route = useRoute<RouteProp<ClaimDetailsRouteProps, 'ClaimDetails'>>();
  const navigation = useNavigation();
  const {claimId} = route.params;
  const {isDark} = require('../context/ThemeContext').useTheme();
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

  // UPDATED: Extract links and images with proper media_url support
  const extractLinks = (claim: any) => {
    console.log('Extracting links and images from claim:', {
      videoLink: claim.videoLink,
      video_link: claim.video_link,
      videoUrl: claim.videoUrl,
      sourceLink: claim.sourceLink,
      source_link: claim.source_link,
      sourceUrl: claim.sourceUrl,
      imageUrl: claim.imageUrl,
      image_url: claim.image_url,
      images: claim.images,
      user_images: claim.user_images,
      userImages: claim.userImages,
      mediaUrl: claim.mediaUrl,
      media_url: claim.media_url, // NEW: Database field
      mediaType: claim.mediaType,
      media_type: claim.media_type, // NEW: Database field
      verdict_image_url: claim.verdict_image_url,
      evidence_image_url: claim.evidence_image_url
    });

    const videoLink = claim.videoLink || claim.video_link || claim.videoUrl || '';
    const sourceLink = claim.sourceLink || claim.source_link || claim.sourceUrl || '';
    
    let userImages: string[] = [];
    
    // PRIORITY 1: Check media_url from database (PUBLIC URL)
    if (claim.media_url && claim.media_type === 'image') {
      userImages = [claim.media_url];
      console.log('✅ Found image in media_url (database):', claim.media_url);
    }
    // PRIORITY 2: Check mediaUrl field
    else if (claim.mediaUrl && (claim.mediaType === 'image' || claim.mediaType === 'media')) {
      userImages = [claim.mediaUrl];
      console.log('✅ Found image in mediaUrl:', claim.mediaUrl);
    }
    // PRIORITY 3: Check userImages array (from backend)
    else if (claim.userImages && Array.isArray(claim.userImages) && claim.userImages.length > 0) {
      userImages = claim.userImages;
      console.log('✅ Found userImages from backend:', userImages);
    }
    // PRIORITY 4: Check legacy image fields
    else if (claim.user_images && Array.isArray(claim.user_images)) {
      userImages = claim.user_images;
      console.log('✅ Found user_images:', claim.user_images);
    } else if (claim.images && Array.isArray(claim.images)) {
      userImages = claim.images;
      console.log('✅ Found images:', claim.images);
    } else if (claim.imageUrl || claim.image_url) {
      userImages = [claim.imageUrl || claim.image_url];
      console.log('✅ Found imageUrl:', claim.imageUrl || claim.image_url);
    }
    
    const verdictImageUrl = claim.verdict_image_url || claim.evidence_image_url || '';

    console.log('📸 Final extracted media:', { 
      videoLink, 
      sourceLink, 
      userImages, 
      verdictImageUrl,
      imageCount: userImages.length
    });

    return {videoLink, sourceLink, userImages, verdictImageUrl};
  };

  // UPDATED: Render user images with error handling
  const renderUserImages = (images: string[]) => {
    if (!images || images.length === 0) return null;

    return (
      <View className="mt-4">
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs font-pmedium mb-3`}>
          Claim Evidence Image ({images.length})
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-2"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View className="flex-row space-x-3">
            {images.map((imageUrl, index) => (
              <View key={index} className="relative">
                <Image
                  source={{uri: imageUrl}}
                  className="w-48 h-48 rounded-lg bg-gray-100"
                  resizeMode="cover"
                  onError={(error) => {
                    console.error(`❌ Failed to load image ${index + 1}:`, imageUrl, error);
                  }}
                  onLoad={() => {
                    console.log(`✅ Successfully loaded image ${index + 1}:`, imageUrl);
                  }}
                />
                {images.length > 1 && (
                  <View className="absolute top-2 right-2 bg-black/50 rounded-full w-6 h-6 items-center justify-center">
                    <Text className="text-white text-xs font-pbold">{index + 1}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
        {images.length > 1 && (
          <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs text-center mt-1`}>
            Scroll horizontally to view all images
          </Text>
        )}
      </View>
    );
  };

  // UPDATED: Render verdict evidence image separately
  const renderVerdictEvidenceImage = (imageUrl: string) => {
    if (!imageUrl) return null;

    return (
      <View className="mt-4">
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs font-pmedium mb-2`}>
          🔍 Fact Checker Evidence
        </Text>
        <Image 
          source={{uri: imageUrl}} 
          className="w-full h-48 rounded-lg"
          resizeMode="cover"
        />
        <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1 italic`}>
          Additional evidence provided by fact checker
        </Text>
      </View>
    );
  };

  const getVerdictStatus = () => {
    if (!claim) return null;

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
    
    if (claim.ai_verdict && claim.ai_verdict.explanation) {
      const aiVerdictText = (claim.ai_verdict.verdict || '').toLowerCase();
      const aiExplanation = (claim.ai_verdict.explanation || '').toLowerCase();
      
      console.log('AI Verdict Analysis:', {
        verdictText: aiVerdictText,
        explanation: aiExplanation.substring(0, 100) + '...'
      });

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
      
      const combinedText = aiVerdictText + ' ' + aiExplanation;
      
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
    
    const sources = new Map<string, { title: string; url: string }>();
    
    if (claim.ai_verdict?.sources && Array.isArray(claim.ai_verdict.sources) && !claim.ai_verdict.is_edited_by_human) {
      claim.ai_verdict.sources.forEach((source: any) => {
        const sourceUrl = source.url || source.link || '';
        const sourceTitle = source.title || source.name || 'Source';
        
        if (sourceUrl && sourceUrl.startsWith('http')) {
          sources.set(sourceUrl, { title: sourceTitle, url: sourceUrl });
        }
      });
    }
    
    if (claim.evidence_sources && Array.isArray(claim.evidence_sources)) {
      claim.evidence_sources.forEach((source: any) => {
        const sourceUrl = source.url || source.link || '';
        const sourceTitle = source.title || source.name || 'Source';
        
        if (sourceUrl && sourceUrl.startsWith('http') && !sources.has(sourceUrl)) {
          sources.set(sourceUrl, { title: sourceTitle, url: sourceUrl });
        }
      });
    }
    
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
  
  const {videoLink, sourceLink, userImages, verdictImageUrl} = extractLinks(claim);

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
                      style={{width: `${claim.ai_verdict.confidence_score * 100}%`}}
                    />
                  </View>
                </View>
              )}
            </View>
          )}

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
            
            {/* UPDATED: Render user images from the new extraction logic */}
            {userImages && userImages.length > 0 && renderUserImages(userImages)}
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

          {(videoLink || sourceLink) && (
            <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-5 mb-6 border`}>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pmedium text-sm mb-3`}>USER-PROVIDED LINKS</Text>
              
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

            <RichTextRenderer 
              text={getVerdictExplanation()} 
              isDark={isDark}
            />

            {verdictImageUrl && renderVerdictEvidenceImage(verdictImageUrl)}
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