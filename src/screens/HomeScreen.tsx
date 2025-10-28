import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeTab, ClaimsListTab, AITab} from '../tabs';
import BlogsTab from '../tabs/BlogsTab';
import {Image, Text, View} from 'react-native';
import {icons} from '../constants';

type TabBarItemProps = {
  source: any; // Adjust type according to your image sources
  focused: boolean;
  cart?: boolean;
  name?: string;
};
const TabBarItem: React.FC<TabBarItemProps> = ({
  source,
  focused,
  cart,
  name,
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
            tintColor: focused ? '#0A864D' : '#666',
            width: 22,
            height: 22,
          }}
        />
      </View>
      {name ? (
        <Text
          className="font-pregular text-[10px] mt-0.5"
          style={{color: focused ? '#0A864D' : '#666'}}>
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

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#E5E7EB',
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
            <TabBarItem source={icons.home} focused={focused} name="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Claims"
        component={ClaimsListTab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({focused}) => (
            <TabBarItem
              source={icons.components}
              focused={focused}
              name="Claims"
            />
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
                    tintColor: focused ? '#0A864D' : '#666',
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
