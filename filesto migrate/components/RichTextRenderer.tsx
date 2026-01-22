import React from 'react';
import { Text, TouchableOpacity, Linking, Alert, View } from 'react-native';

interface RichTextRendererProps {
  text: string;
  isDark?: boolean;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ text, isDark = false }) => {
  if (!text) return null;

  // Format text: Remove numbered lists, replace with bullets
  let formattedText = text.replace(/^\d+[\.)]\s*/gm, '• ');
  // Remove asterisks used for bold
  formattedText = formattedText.replace(/\*\*/g, '');
  // Remove double brackets from links like [[1]], [[2]], [[123]] or [[http://...]]
  formattedText = formattedText.replace(/\[\[([^\]]+)\]\]/g, '$1');
  // Remove numbering before links like "1. http://" or "1) http://"
  formattedText = formattedText.replace(/^\d+[\.)]\s*(https?:\/\/)/gm, '$1');

  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split text by URLs
  const parts = formattedText.split(urlRegex);
  
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  return (
    <View>
      <Text className={`${isDark ? 'text-gray-300' : 'text-gray-800'} font-pregular text-sm leading-6`}>
        {parts.map((part, index) => {
          // Check if this part is a URL
          if (part.match(urlRegex)) {
            return (
              <Text
                key={index}
                className="text-blue-500 underline font-pmedium"
                onPress={() => handleLinkPress(part)}
                style={{ flexWrap: 'wrap' }}
              >
                {part}
              </Text>
            );
          }
          
          // Format topics (text before colons) in bold
          const topicRegex = /^([^:]+:)/gm;
          const textParts = part.split(topicRegex);
          
          return textParts.map((textPart, tIndex) => {
            if (textPart.endsWith(':')) {
              // Topic text - bold only (not green)
              return (
                <Text key={`${index}-${tIndex}`} className={`font-pbold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {textPart}
                </Text>
              );
            }
            return <Text key={`${index}-${tIndex}`}>{textPart}</Text>;
          });
        })}
      </Text>
    </View>
  );
};

export default RichTextRenderer;
