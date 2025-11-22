import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import * as ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: {
    type: 'image' | 'file';
    uri: string;
    name?: string;
  }[];
}

type Props = {};

const AITab = (props: Props) => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<{type: 'image' | 'file', uri: string, name?: string}[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory();
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem('ai_chat_history');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        // Set initial welcome message if no history
        setMessages([{
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your AI Fact-Checking Assistant. I can help you verify claims, analyze statements, and fact-check information. How can I assist you today?',
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const saveChatHistory = async () => {
    try {
      await AsyncStorage.setItem('ai_chat_history', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  const clearChatHistory = async () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('ai_chat_history');
              setMessages([{
                id: '1',
                role: 'assistant',
                content: 'Hello! I\'m your AI Fact-Checking Assistant. I can help you verify claims, analyze statements, and fact-check information. How can I assist you today?',
                timestamp: new Date(),
              }]);
            } catch (error) {
              console.error('Failed to clear chat history:', error);
            }
          }
        }
      ]
    );
  };

  const handleSend = async () => {
    if (!inputText.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        prompt: inputText,
        hasAttachments: currentAttachments.length > 0,
        attachmentTypes: currentAttachments.map(a => a.type),
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formatAIResponse(response.data.response),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    Alert.alert(
      'Upload File',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => launchCamera(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => launchImageLibrary(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const launchImageLibrary = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setAttachments(prev => [...prev, {
          type: 'image',
          uri: response.assets![0].uri!,
          name: response.assets![0].fileName,
        }]);
      }
    });
  };

  const launchCamera = () => {
    const options: ImagePicker.CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
    };

    ImagePicker.launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        setAttachments(prev => [...prev, {
          type: 'image',
          uri: response.assets![0].uri!,
          name: response.assets![0].fileName,
        }]);
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ FIXED: Format AI response to remove numbered lists, double brackets, and numbering from links
  const formatAIResponse = (text: string): string => {
    // Remove double brackets from links like [[1]], [[2]], [[123]] or [[http://...]] - FIXED
    let formatted = text.replace(/\[\[([^\]]+)\]\]/g, '$1');
    // Remove numbered list patterns like "1.", "2.", "1)", "2)" - FIXED
    formatted = formatted.replace(/^\d+[\.)]\s*/gm, '');
    // Remove asterisks used for bold
    formatted = formatted.replace(/\*\*/g, '');
    // Remove numbering before links like "1. http://" or "1) http://"
    formatted = formatted.replace(/^\d+[\.)]\s*(https?:\/\/)/gm, '$1');
    return formatted;
  };

  // Render formatted text with clickable links and styled topics
  const renderFormattedText = (text: string) => {
    // Split text by URLs and format topics
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
      <Text className={`text-[15px] leading-6 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            // Render clickable link
            return (
              <Text
                key={index}
                className="text-blue-500 underline"
                onPress={() => Linking.openURL(part).catch(() => Alert.alert('Error', 'Cannot open link'))}
              >
                {part}
              </Text>
            );
          } else {
            // Format topics (text before colons) in bold green
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
          }
        })}
      </Text>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header - Clean and Simple with Clear History */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} pt-12 pb-3 px-6`}>
        <View className="flex-row justify-between items-center">
          <Text className={`text-base font-psemibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            AI Fact-Checker
          </Text>
          <TouchableOpacity onPress={clearChatHistory}>
            <Text className="text-[#0A864D] font-pmedium text-sm">Clear History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View 
            key={message.id}
            className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <View className="max-w-[85%]">
              <View 
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-[#0A864D]' 
                    : isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-100'
                }`}
              >
                {/* Attachments Section */}
                {message.attachments && message.attachments.length > 0 && (
                  <View className="mb-2">
                    {message.attachments.map((att, idx) => (
                      <View key={idx} className="mb-1">
                        {att.type === 'image' ? (
                          <View className="rounded-lg overflow-hidden">
                            <Image 
                              source={{uri: att.uri}} 
                              className="w-48 h-48 rounded-lg"
                              resizeMode="cover"
                            />
                          </View>
                        ) : (
                          <View className="bg-white/10 rounded-lg p-2 border border-white/20">
                            <Text className={`text-sm ${message.role === 'user' ? 'text-white/90' : 'text-gray-600'}`}>
                              📎 {att.name}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Message Text */}
                {message.content && (
                  <View>
                    {message.role === 'user' ? (
                      <Text className="text-[15px] leading-6 text-white">
                        {message.content}
                      </Text>
                    ) : (
                      renderFormattedText(message.content)
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}

        {isLoading && (
          <View className="items-start mb-4">
            <View className="max-w-[85%]">
              <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'} rounded-2xl px-4 py-3 border`}>
                <ActivityIndicator size="small" color="#0A864D" />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* File Upload Preview */}
      {attachments.length > 0 && (
        <View className={`px-4 pt-2 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <View className="flex-row flex-wrap">
            {attachments.map((att, idx) => (
              <View key={idx} className="mr-2 mb-2">
                {att.type === 'image' ? (
                  <View className="relative">
                    <Image 
                      source={{uri: att.uri}} 
                      className="w-14 h-14 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      onPress={() => removeAttachment(idx)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                    >
                      <Text className="text-white text-xs font-bold">×</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                    <Text className="text-gray-700 text-xs mr-2">
                      📎 {att.name?.substring(0, 15) || 'file'}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => removeAttachment(idx)}
                      className="w-4 h-4 items-center justify-center"
                    >
                      <Text className="text-gray-500 text-sm">×</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Input Area - Lovable Style */}
      <View className={`px-3 py-3 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'} border-t`}>
        {/* Main Input Container - Lovable Style */}
        <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl border shadow-sm`}>
          <View className="flex-row items-end px-3 py-2">
            {/* Plus Icon for Upload - Left Side */}
            <TouchableOpacity 
              onPress={handleFileUpload}
              className="w-9 h-9 items-center justify-center mb-1"
            >
              <View className={`w-7 h-7 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} items-center justify-center`}>
                <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg font-normal`}>+</Text>
              </View>
            </TouchableOpacity>
            
            {/* Text Input - Center */}
            <View className="flex-1 min-h-[36px] max-h-[100px] justify-center px-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything..."
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                multiline
                className={`${isDark ? 'text-gray-100' : 'text-gray-900'} text-[15px] leading-5 py-1`}
                style={{ 
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
              />
            </View>
            
            {/* Send Button - Right Side */}
            <TouchableOpacity 
              onPress={handleSend}
              disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
              className="mb-1"
            >
              <View 
                className={`w-8 h-8 items-center justify-center rounded-full ${
                  isLoading || (!inputText.trim() && attachments.length === 0) 
                    ? 'bg-gray-200' 
                    : 'bg-[#0A864D]'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-bold">↑</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Disclaimer */}
        <Text className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'} text-center mt-2`}>
          AI can make mistakes. Always verify important information.
        </Text>
      </View>
    </View>
  );
};

export default AITab;