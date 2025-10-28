import {View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {claimsService, Claim} from '../services/claimsService';
import {formatDate} from '../utils/dateFormatter';

type Props = {};

const VerifiedClaimsTab = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchVerifiedClaims();
    }, [])
  );

  const fetchVerifiedClaims = async () => {
    setLoading(true);
    try {
      // Fetch all verified claims (from all users)
      const data = await claimsService.getAllVerifiedClaims();
      
      // Sort by most recent verdict date
      const sortedClaims = data.sort((a, b) => {
        const dateA = new Date(a.verdictDate || a.updated_at || a.created_at || 0);
        const dateB = new Date(b.verdictDate || b.updated_at || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setClaims(sortedClaims);
    } catch (error: any) {
      const userMessage = error.message?.includes('Network') 
        ? 'Please check your internet connection and try again.' 
        : 'Failed to load verified claims.';
      Alert.alert('Error', userMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVerifiedClaims();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100';
      case 'false':
        return 'bg-red-100';
      case 'misleading':
        return 'bg-orange-100';
      case 'needs_context':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-700';
      case 'false':
        return 'text-red-700';
      case 'misleading':
        return 'text-orange-700';
      case 'needs_context':
        return 'text-yellow-700';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return '✓ True';
      case 'false':
        return '✗ False';
      case 'misleading':
        return '⚠ Misleading';
      case 'needs_context':
        return '📋 Needs Context';
      default:
        return 'Unknown';
    }
  };

  const getVerificationBadge = (claim: Claim) => {
    if (claim.verified_by_ai) {
      return {
        text: 'AI Verified',
        emoji: '🤖',
        color: 'bg-blue-100',
        textColor: 'text-blue-700'
      };
    }
    return {
      text: 'Human Verified',
      emoji: '👤',
      color: 'bg-purple-100',
      textColor: 'text-purple-700'
    };
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A864D']} />
        }
      >
        {loading && (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#0A864D" />
          </View>
        )}

        <View className="px-6 py-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-psemibold text-gray-900">
              All Verified Claims
            </Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-pbold">
                {claims.length} Claims
              </Text>
            </View>
          </View>

          {claims.map((claim) => {
            const verificationBadge = getVerificationBadge(claim);
            
            return (
              <TouchableOpacity
                key={claim.id}
                onPress={() => navigation.navigate('ClaimDetails', { claimId: claim.id })}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                {/* Header with verification badge */}
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
                    <View className={`px-2 py-1 rounded-full ml-2 ${verificationBadge.color}`}>
                      <Text className={`text-xs font-psemibold ${verificationBadge.textColor}`}>
                        {verificationBadge.emoji} {verificationBadge.text}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Title */}
                <Text className="text-gray-900 font-pbold text-base mb-2 leading-5">
                  {claim.title}
                </Text>

                {/* Description */}
                {claim.description && (
                  <Text className="text-gray-600 font-pregular text-sm mb-3 leading-5" numberOfLines={2}>
                    {claim.description}
                  </Text>
                )}

                {/* Status Badge */}
                <View className={`px-3 py-1.5 rounded-full self-start mb-3 ${getStatusColor(claim.status)}`}>
                  <Text className={`text-xs font-psemibold ${getStatusTextColor(claim.status)}`}>
                    {getStatusLabel(claim.status)}
                  </Text>
                </View>

                {/* Footer with dates */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <Text className="text-gray-500 text-xs font-pregular">
                    Submitted: {formatDate(claim.submittedDate || claim.created_at || '')}
                  </Text>
                  {claim.verdictDate && (
                  <Text className="text-green-600 text-xs font-pmedium">
                    Verified: {formatDate(claim.verdictDate || claim.updated_at || '')}
                  </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Empty State */}
          {claims.length === 0 && !loading && (
            <View className="items-center justify-center py-12">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                <Text className="text-gray-400 text-2xl">✓</Text>
              </View>
              <Text className="text-gray-500 font-pregular text-sm text-center">
                No verified claims yet{"\n"}
                <Text className="text-gray-400">Check back later</Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default VerifiedClaimsTab;
