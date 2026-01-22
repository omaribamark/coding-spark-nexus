import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import ClaimsListTab from '@/tabs/ClaimsListTab';
import VerifiedClaimsTab from '@/tabs/VerifiedClaimsTab';

const ClaimsTab = () => {
  const [activeTab, setActiveTab] = useState('My Claims');
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff', paddingTop: insets.top }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#FFFFFF"} translucent />
      
      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1F2937' : '#fff', borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#E5E7EB' }}>
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
              style={{
                textAlign: 'center',
                fontWeight: '500',
                fontSize: 14,
                color: activeTab === tab ? '#0A864D' : '#6B7280',
              }}>
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
