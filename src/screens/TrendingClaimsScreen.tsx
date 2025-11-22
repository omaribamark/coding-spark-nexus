import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {claimsService, Claim} from '../services/claimsService';

type Props = {};

const TrendingClaimsScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [trendingClaims, setTrendingClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingClaims();
  }, []);

  const fetchTrendingClaims = async () => {
    try {
      setLoading(true);
      const data = await claimsService.getAllVerifiedClaims();
      // Sort by latest first
      const sorted = data.sort((a, b) => 
        new Date(b.submittedDate || b.created_at || '').getTime() - 
        new Date(a.submittedDate || a.created_at || '').getTime()
      );
      setTrendingClaims(sorted);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch trending claims');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#0A864D';
      case 'false':
        return '#dc2626';
      case 'misleading':
        return '#EF9334';
      case 'needs_context':
        return '#3b82f6';
      default:
        return '#6b7280';
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
        return '⏳ Pending';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className="text-gray-600 mt-4 font-pregular">Loading claims...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Clean Header - Updated to match SubmitClaimScreen */}
      <View className="bg-white pt-4 pb-4 px-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-gray-900 text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-pbold">Trending Claims</Text>
          <View style={{width: 24}} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {trendingClaims.map(claim => (
          <TouchableOpacity
            key={claim.id}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('ClaimDetails', { claimId: claim.id })}>
            <View className="flex-row items-center justify-between mb-3">
              <View
                style={{backgroundColor: '#0A864D'}}
                className="px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-psemibold">
                  {claim.category}
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{backgroundColor: getStatusColor(claim.status)}}>
                <Text className="text-white text-xs font-psemibold">
                  {getStatusLabel(claim.status)}
                </Text>
              </View>
            </View>

            <Text className="text-gray-900 font-pbold text-base mb-2 leading-5">
              {claim.title || claim.description}
            </Text>

            <Text className="text-gray-600 font-pregular text-sm mb-3" numberOfLines={2}>
              {claim.description || claim.title || 'Tap to view more details'}
            </Text>

            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
              <Text className="text-gray-500 text-xs font-pregular">
                {new Date(claim.submittedDate || claim.created_at || '').toLocaleDateString()}
              </Text>
              <Text className="text-[#0A864D] text-xs font-pmedium">
                View Details →
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {trendingClaims.length === 0 && (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-400 text-xl mb-2">🔥</Text>
            <Text className="text-gray-500 font-pregular text-center">
              No trending claims at the moment
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TrendingClaimsScreen;