import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import React from 'react';

type CustomButtonProps = {
  title: string;
  handlePress: () => void;
  containerStyle?: string;
  testStyles?: string;
  isLoading?: boolean;
  textStyle?: string;
  disabled?: boolean;
};

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handlePress,
  containerStyle,
  testStyles,
  isLoading,
  textStyle,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-action rounded-xl max-w-md w-full self-center flex flex-row justify-center items-center ${containerStyle} ${
        isLoading || disabled ? 'opacity-50' : ''
      }`}
      disabled={isLoading || disabled}>
      <Text className={`text-white font-bold text-lg ${textStyle}`}>
        {title}
      </Text>
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color={'#fff'}
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;