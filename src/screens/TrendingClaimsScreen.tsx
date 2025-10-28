import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {mockClaims} from '../constants/claimsData';

type Props = {};

const TrendingClaimsScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  const trendingClaims = mockClaims.filter(claim => claim.isTrending);

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

  if (selectedClaim) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View style={{backgroundColor: '#0A864D'}} className="pt-12 pb-6 px-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => setSelectedClaim(null)}>
              <Text className="text-white text-3xl">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-pbold">Claim Details</Text>
            <View style={{width: 30}} />
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          <View
            className="px-4 py-2 rounded-full self-start mb-4"
            style={{backgroundColor: getStatusColor(selectedClaim.status)}}>
            <Text className="text-white text-sm font-psemibold">
              {getStatusLabel(selectedClaim.status)}
            </Text>
          </View>

          <Text className="text-2xl font-pbold text-gray-900 mb-4">
            {selectedClaim.title}
          </Text>

          <Text className="text-gray-600 font-pregular text-base leading-6 mb-6">
            {selectedClaim.description || 'No additional description available.'}
          </Text>

          {selectedClaim.verdict && (
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
              <Text className="font-pbold text-blue-900 mb-2">Verdict</Text>
              <Text className="text-gray-700 font-pregular leading-6">
                {selectedClaim.verdict}
              </Text>
            </View>
          )}

          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600 font-pmedium">Category</Text>
              <Text className="font-psemibold text-gray-900">
                {selectedClaim.category}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600 font-pmedium">Submitted</Text>
              <Text className="font-psemibold text-gray-900">
                {selectedClaim.submittedDate}
              </Text>
            </View>
            {selectedClaim.verdictDate && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600 font-pmedium">Verified</Text>
                <Text className="font-psemibold text-gray-900">
                  {selectedClaim.verdictDate}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{backgroundColor: '#0A864D'}} className="pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-white text-3xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-pbold">Trending Claims</Text>
          <View style={{width: 30}} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {trendingClaims.map(claim => (
          <TouchableOpacity
            key={claim.id}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => setSelectedClaim(claim)}>
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
              {claim.title}
            </Text>

            <Text className="text-gray-600 font-pregular text-sm mb-3" numberOfLines={2}>
              {claim.description || 'Tap to view more details'}
            </Text>

            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
              <Text className="text-gray-500 text-xs font-pregular">
                {claim.submittedDate}
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
