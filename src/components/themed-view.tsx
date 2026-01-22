import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ThemedView: React.FC<ViewProps> = (props) => {
  const { isDark } = useTheme();

  return (
    <View
      {...props}
      style={[
        props.style,
        { backgroundColor: isDark ? '#111' : '#fff' }
      ]}
    />
  );
};
