import React, { useState } from 'react';
import {Text, TextInput, View, TouchableOpacity, Image} from 'react-native';
import {icons} from '../constants';

interface LineInputFieldProps {
  title: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  fieldName: string;
  focusedField: string | null;
  onFocus: () => void;
  onBlur: () => void;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
}

const LineInputField: React.FC<LineInputFieldProps> = ({
  title,
  value,
  placeholder,
  onChangeText,
  error,
  secureTextEntry = false,
  multiline = false,
  fieldName,
  focusedField,
  onFocus,
  onBlur,
  editable = true,
  keyboardType,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  return (
    <View className="mb-4" collapsable={false}>
      <Text className="text-gray-700 text-sm font-pmedium mb-1">{title}</Text>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          placeholderTextColor="#9CA3AF"
          editable={editable}
          className="text-gray-900 text-base font-pregular pb-2"
          style={{
            borderBottomWidth: focusedField === fieldName ? 2 : 1,
            borderBottomColor: error
              ? '#EF4444'
              : focusedField === fieldName
              ? '#0A864D'
              : '#D1D5DB',
            height: multiline ? 80 : 35,
            textAlignVertical: multiline ? 'top' : 'center',
            opacity: editable ? 1 : 0.6,
            paddingRight: secureTextEntry ? 40 : 0,
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={keyboardType || (fieldName === 'email' ? 'email-address' : 'default')}
          returnKeyType="next"
          blurOnSubmit={false}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-0 bottom-2"
            style={{ padding: 8 }}
          >
            <Image
              source={isPasswordVisible ? icons.eye : icons.eyeHide}
              className="w-5 h-5"
              style={{ tintColor: '#6B7280' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text className="text-red-500 text-xs font-pregular mt-1">{error}</Text>
      ) : null}
    </View>
  );
};

export default LineInputField;
