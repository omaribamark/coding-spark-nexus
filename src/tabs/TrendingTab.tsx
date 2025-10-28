import {View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {claimsService} from '../services/claimsService';

type Props = {};

const TrendingTab = (props: Props) => {
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
        return '✓ Verified';
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

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{backgroundColor: '#EF9334'}} className="pt-16 pb-8 px-6">
        <Text className="text-white text-3xl font-pbold mb-2">Trending</Text>
        <Text className="text-white/90 text-base font-pregular">
          Most verified claims
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
        className="px-6 py-6"
        renderItem={({item, index}) => (
          <TouchableOpacity className="bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-100">
            {/* Trending Badge */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="bg-[#EF9334] px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-pbold">
                  🔥 #{index + 1} Trending
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                <Text className={`text-xs font-psemibold ${getStatusTextColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            {/* Claim Title */}
            <Text className="text-gray-900 font-pbold text-lg mb-2">
              {item.title}
            </Text>

            {/* Category */}
            <View className="flex-row items-center mb-3">
              <View className="bg-gray-200 px-3 py-1 rounded-full mr-2">
                <Text className="text-gray-700 text-xs font-pmedium">
                  {item.category}
                </Text>
              </View>
            </View>

            {/* Verdict */}
            {item.verdict && (
              <Text className="text-gray-600 font-pregular text-sm mb-3">
                {item.verdict}
              </Text>
            )}

            {/* Date */}
            <Text className="text-gray-400 text-xs font-pregular">
              Verified: {item.verdict_date || item.submitted_date}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-400 text-base font-pregular">
              No trending claims yet
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default TrendingTab;
