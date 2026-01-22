import React from 'react';
import { View, StatusBar, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * SafeScreen - A responsive container that properly handles:
 * - Status bar area (notch, camera cutout)
 * - Bottom navigation area (home indicator, nav buttons)
 * - Works across all screen sizes and devices
 */
const SafeScreen: React.FC<SafeScreenProps> = ({
  children,
  backgroundColor = '#FFFFFF',
  statusBarStyle = 'dark-content',
  edges = ['top', 'bottom'],
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={containerStyle}>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      {children}
    </View>
  );
};

export default SafeScreen;
