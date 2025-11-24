import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ClaimsListTab from './ClaimsListTab';
import VerifiedClaimsTab from './VerifiedClaimsTab';

const ClaimsTab = () => {
  const [activeTab, setActiveTab] = useState('My Claims');

  return (
    <View className="flex-1">
      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        {['My Claims', 'All Verified'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab ? '#0A864D' : 'transparent',
            }}>
            <Text
              className={`text-center font-pmedium text-sm ${
                activeTab === tab ? 'text-[#0A864D]' : 'text-gray-500'
              }`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'My Claims' && <ClaimsListTab />}
      {activeTab === 'All Verified' && <VerifiedClaimsTab />}
    </View>
  );
};

export default ClaimsTab;
