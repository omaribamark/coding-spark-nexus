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
import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import { useTheme } from '@/context/ThemeContext';

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

const AITab = () => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        prompt: inputText,
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

  const formatAIResponse = (text: string): string => {
    let formatted = text.replace(/\[\[([^\]]+)\]\]/g, '$1');
    formatted = formatted.replace(/^\d+[\.)]\s*/gm, '');
    formatted = formatted.replace(/\*\*/g, '');
    formatted = formatted.replace(/^\d+[\.)]\s*(https?:\/\/)/gm, '$1');
    return formatted;
  };

  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
      <Text style={{ fontSize: 15, lineHeight: 24, color: isDark ? '#E5E7EB' : '#1F2937' }}>
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <Text
                key={index}
                style={{ color: '#3B82F6', textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL(part).catch(() => Alert.alert('Error', 'Cannot open link'))}
              >
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff', paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ backgroundColor: isDark ? '#1F2937' : '#fff', paddingVertical: 12, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#111827' }}>
            AI Fact-Checker
          </Text>
          <TouchableOpacity onPress={clearChatHistory}>
            <Text style={{ color: '#0A864D', fontWeight: '500', fontSize: 14 }}>Clear History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: isDark ? '#111827' : '#fff' }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View 
            key={message.id}
            style={{ marginBottom: 16, alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <View style={{ maxWidth: '85%' }}>
              <View 
                style={{
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: message.role === 'user' 
                    ? '#0A864D' 
                    : isDark ? '#1F2937' : '#F3F4F6',
                  borderWidth: message.role === 'assistant' ? 1 : 0,
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                }}
              >
                {message.content && (
                  <View>
                    {message.role === 'user' ? (
                      <Text style={{ fontSize: 15, lineHeight: 24, color: '#fff' }}>
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
          <View style={{ alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ maxWidth: '85%' }}>
              <View style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#E5E7EB' }}>
                <ActivityIndicator size="small" color="#0A864D" />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 12, backgroundColor: isDark ? '#111827' : '#fff', borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6', paddingBottom: insets.bottom + 12 }}>
        <View style={{ backgroundColor: isDark ? '#1F2937' : '#fff', borderRadius: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#E5E7EB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8 }}>
            <View style={{ flex: 1, minHeight: 36, maxHeight: 100, justifyContent: 'center', paddingHorizontal: 8 }}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything..."
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                multiline
                style={{ 
                  color: isDark ? '#F3F4F6' : '#111827',
                  fontSize: 15,
                  lineHeight: 20,
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
              />
            </View>
            
            <TouchableOpacity 
              onPress={handleSend}
              disabled={isLoading || !inputText.trim()}
              style={{ marginBottom: 4 }}
            >
              <View 
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 16,
                  backgroundColor: isLoading || !inputText.trim() ? '#E5E7EB' : '#0A864D',
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>↑</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={{ fontSize: 11, color: isDark ? '#6B7280' : '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
          AI can make mistakes. Always verify important information.
        </Text>
      </View>
    </View>
  );
};

export default AITab;
