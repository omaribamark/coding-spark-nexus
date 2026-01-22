import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Image } from 'react-native';
import { icons } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { claimsService } from '@/services/claimsService';
import NotificationBadge from '@/components/NotificationBadge';

type TabBarItemProps = {
  source: any;
  focused: boolean;
  name?: string;
  isDark?: boolean;
};

const TabBarItem: React.FC<TabBarItemProps> = ({ source, focused, name, isDark }) => {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
      }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: 'auto',
          height: 'auto',
        }}>
        <Image
          source={source}
          style={{
            tintColor: focused ? '#0A864D' : (isDark ? '#9CA3AF' : '#666'),
            width: 22,
            height: 22,
          }}
        />
      </View>
      {name ? (
        <Text
          style={{
            color: focused ? '#0A864D' : (isDark ? '#9CA3AF' : '#666'),
            fontSize: 10,
            marginTop: 2,
          }}>
          {name}
        </Text>
      ) : null}
    </View>
  );
};

export default function TabLayout() {
  const { isDark } = useTheme();
  const [unreadVerdictCount, setUnreadVerdictCount] = useState(0);

  useEffect(() => {
    fetchUnreadVerdictCount();
    
    // Poll for unread verdicts every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadVerdictCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadVerdictCount = async () => {
    try {
      const count = await claimsService.getUnreadVerdictCount();
      setUnreadVerdictCount(count);
    } catch (error) {
      console.error('Error fetching unread verdict count:', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : 'white',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          height: 56,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem source={icons.home} focused={focused} name="Home" isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ position: 'relative' }}>
              <TabBarItem source={icons.components} focused={focused} name="Claims" isDark={isDark} />
              <NotificationBadge count={unreadVerdictCount} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="blogs"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem source={icons.components} focused={focused} name="Blogs" isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
              <Image
                source={icons.ai}
                style={{
                  tintColor: focused ? '#0A864D' : (isDark ? '#9CA3AF' : '#666'),
                  width: 28,
                  height: 28,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem source={icons.setting} focused={focused} name="Settings" isDark={isDark} />
          ),
        }}
      />
    </Tabs>
  );
}
