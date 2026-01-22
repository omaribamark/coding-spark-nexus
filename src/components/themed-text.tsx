import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ThemedText: React.FC<TextProps> = (props) => {
  const { isDark } = useTheme();

  return (
    <Text
      {...props}
      style={[
        props.style,
        { color: isDark ? '#fff' : '#000' }
      ]}
    />
  );
};
