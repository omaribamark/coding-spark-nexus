import {View, Text, TouchableOpacity, StatusBar} from 'react-native';
import React, {useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import ClaimsListTab from './ClaimsListTab';
import VerifiedClaimsTab from './VerifiedClaimsTab';
import { useTheme } from '../context/ThemeContext';

const ClaimsTab = () => {
  const [activeTab, setActiveTab] = useState('My Claims');
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`} style={{paddingTop: insets.top}}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#FFFFFF"} translucent />
      {/* Tabs */}
      <View className={`flex-row ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
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
