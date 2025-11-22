import React, { useState, useEffect } from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeTab, ClaimsListTab, AITab} from '../tabs';
import BlogsTab from '../tabs/BlogsTab';
import {Image, Text, View} from 'react-native';
import {icons} from '../constants';
import {useTheme} from '../context/ThemeContext';
import NotificationBadge from '../components/NotificationBadge';
import claimsService from '../services/claimsService';

type TabBarItemProps = {
  source: any;
  focused: boolean;
  cart?: boolean;
  name?: string;
  isDark?: boolean;
};
const TabBarItem: React.FC<TabBarItemProps> = ({
  source,
  focused,
  cart,
  name,
  isDark,
}) => {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: cart ? -24 : 8,
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
          className="font-pregular text-[10px] mt-0.5"
          style={{color: focused ? '#0A864D' : (isDark ? '#9CA3AF' : '#666')}}>
          {name}
        </Text>
      ) : null}
    </View>
  );
};
type Props = {};
export type RouteTabsParamList = {
  Home: undefined;
  Claims: undefined;
  Blogs: undefined;
  AI: undefined;
};
const HomeScreen = (props: Props) => {
  const Tab = createBottomTabNavigator<RouteTabsParamList>();
  const { isDark } = useTheme();
  const [unreadVerdictCount, setUnreadVerdictCount] = useState(0);

  useEffect(() => {
    console.log('🏠 HomeScreen mounted - fetching unread verdicts');
    fetchUnreadVerdictCount();
    
    // Poll for unread verdicts every 30 seconds
    const interval = setInterval(() => {
      console.log('🔄 Polling for unread verdicts...');
      fetchUnreadVerdictCount();
    }, 30000);
    
    return () => {
      console.log('🏠 HomeScreen unmounting - clearing interval');
      clearInterval(interval);
    };
  }, []);

  const fetchUnreadVerdictCount = async () => {
    try {
      const count = await claimsService.getUnreadVerdictCount();
      console.log('📱 Unread verdict count fetched:', count);
      setUnreadVerdictCount(count);
    } catch (error) {
      console.error('Error fetching unread verdict count:', error);
      // Don't reset count on error to avoid hiding existing notifications
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
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
        tabBarIconStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({focused}) => (
            <TabBarItem source={icons.home} focused={focused} name="Home" isDark={isDark} />
          ),
        }}
      />
      <Tab.Screen
        name="Claims"
        component={ClaimsListTab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({focused}) => (
            <View style={{ position: 'relative' }}>
              <TabBarItem
                source={icons.components}
                focused={focused}
                name="Claims"
                isDark={isDark}
              />
              <NotificationBadge count={unreadVerdictCount} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Blogs"
        component={BlogsTab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({focused}) => (
            <TabBarItem 
              source={icons.components} 
              focused={focused} 
              name="Blogs" 
              isDark={isDark}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AI"
        component={AITab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({focused}) => (
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
                  source={icons.ai}
                  style={{
                    tintColor: focused ? '#0A864D' : (isDark ? '#9CA3AF' : '#666'),
                    width: 28,
                    height: 28,
                  }}
                />
              </View>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeScreen;
