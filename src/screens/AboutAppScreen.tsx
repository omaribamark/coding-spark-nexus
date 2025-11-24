import {View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {icons} from '../constants';

type Props = {};

const AboutAppScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendEmail = async () => {
    if (!email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // change to creco email
      const emailData = {
        to: 'kellynyachiro@gmail.com',
        from: email,
        message: message,
        timestamp: new Date().toISOString(),
      };

      console.log('Email would be sent to:', emailData.to);
      console.log('Email content:', emailData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Message Sent', 
        'Your message has been sent successfully. We will get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              setMessage('');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = email.trim() && message.trim() && email.includes('@');

  return (
    <View className="flex-1 bg-white">
      {/* Enhanced Header */}
      <View className="bg-blue-600 pt-12 pb-5 px-6 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="mr-4 p-2 bg-white/20 rounded-lg"
          >
            <Image
              source={icons.arrow_right}
              className="w-5 h-5 rotate-180"
              tintColor="white"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-pbold flex-1">About CRECO</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 py-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 30}}
      >
        {/* What is CRECO */}
        <View className="mb-8 bg-blue-50 rounded-2xl p-5 border-l-4 border-blue-500">
          <Text className="text-blue-800 text-xl font-pbold mb-3">What is Hakikisha?</Text>
          <Text className="text-gray-800 font-pregular text-base leading-7">
            CRECO is an AI-powered platform dedicated to promoting civic awareness, 
            transparency, and informed community participation. We provide fact-checking 
            and educational resources to empower citizens with accurate information.
          </Text>
        </View>

        {/* Our Focus Areas */}
        <View className="mb-8">
          <Text className="text-gray-900 text-xl font-pbold mb-4">Our Focus Areas</Text>

          <View className="space-y-4">
            {/* Civic Education */}
            <View className="bg-blue-100 rounded-2xl p-5 border-l-4 border-blue-600 shadow-sm">
              <Text className="text-blue-900 font-psemibold text-lg mb-3">Civic Education</Text>
              <Text className="text-gray-800 font-pregular text-base leading-6">
                Access educational resources about civic rights, responsibilities, 
                and community participation with verified information.
              </Text>
            </View>

            {/* Legal Awareness */}
            <View className="bg-purple-100 rounded-2xl p-5 border-l-4 border-purple-600 shadow-sm">
              <Text className="text-purple-900 font-psemibold text-lg mb-3">Legal Awareness</Text>
              <Text className="text-gray-800 font-pregular text-base leading-6">
                Understand legal frameworks and rights with simplified explanations 
                and expert insights for better community understanding.
              </Text>
            </View>

            {/* Community Engagement */}
            <View className="bg-green-100 rounded-2xl p-5 border-l-4 border-green-600 shadow-sm">
              <Text className="text-green-900 font-psemibold text-lg mb-3">Community Engagement</Text>
              <Text className="text-gray-800 font-pregular text-base leading-6">
                Engage with civic resources and participate effectively in community 
                processes and discussions.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Us Form */}
        <View className="mb-8">
          <Text className="text-gray-900 text-xl font-pbold mb-4">Contact Us</Text>

          <View className="bg-gray-50 rounded-2xl p-5 border border-gray-300 shadow-sm">
            <Text className="text-gray-700 font-pregular text-base leading-6 mb-5">
              Have questions or feedback? Send us a message and we'll get back to you as soon as possible.
            </Text>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-900 font-psemibold text-base mb-2">Your Email</Text>
              <TextInput
                className="bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-pregular text-base"
                placeholder="Enter your email address"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Message Input */}
            <View className="mb-5">
              <Text className="text-gray-900 font-psemibold text-base mb-2">Message</Text>
              <TextInput
                className="bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-pregular text-base min-h-[120px]"
                placeholder="Type your message here..."
                placeholderTextColor="#6B7280"
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center justify-center shadow-sm ${
                isFormValid && !isSubmitting 
                  ? 'bg-blue-600' 
                  : 'bg-gray-400'
              }`}
              onPress={handleSendEmail}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <Text className="text-white font-psemibold text-base mr-2">Sending...</Text>
                </View>
              ) : (
                <Text className="text-white font-psemibold text-base">Send Message</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Key Features */}
        <View className="mb-8">
          <Text className="text-gray-900 text-xl font-pbold mb-4">Key Features</Text>

          {/* Feature 1 */}
          <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-4 border-l-4 border-indigo-500 shadow-sm">
            <Text className="text-indigo-900 font-psemibold text-lg mb-3">AI Assistant</Text>
            <Text className="text-gray-800 font-pregular text-base leading-6">
              Chat with our AI assistant to verify information, get clarifications on civic matters, 
              and access reliable responses powered by advanced AI.
            </Text>
          </View>

          {/* Feature 2 */}
          <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-4 border-l-4 border-emerald-500 shadow-sm">
            <Text className="text-emerald-900 font-psemibold text-lg mb-3">Verified Information</Text>
            <Text className="text-gray-800 font-pregular text-base leading-6">
              Access our comprehensive database of fact-checked information and 
              reliable sources on various civic and community topics.
            </Text>
          </View>

          {/* Feature 3 */}
          <View className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-4 border-l-4 border-orange-500 shadow-sm">
            <Text className="text-orange-900 font-psemibold text-lg mb-3">Educational Resources</Text>
            <Text className="text-gray-800 font-pregular text-base leading-6">
              Learn about civic rights, community systems, and responsible participation 
              through our educational content and resources.
            </Text>
          </View>
        </View>

        {/* How It Works */}
        <View className="mb-8">
          <Text className="text-gray-900 text-xl font-pbold mb-4">How It Works</Text>

          <View className="space-y-4">
            <View className="flex-row items-start bg-gray-50 rounded-2xl p-4">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-4 mt-1 shadow-sm">
                <Text className="text-white font-pbold text-base">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-lg mb-2">Submit Your Question</Text>
                <Text className="text-gray-800 font-pregular text-base leading-6">
                  Ask about community information, civic matters, or any topic you want to verify.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start bg-gray-50 rounded-2xl p-4">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-4 mt-1 shadow-sm">
                <Text className="text-white font-pbold text-base">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-lg mb-2">AI Analysis</Text>
                <Text className="text-gray-800 font-pregular text-base leading-6">
                  Our AI analyzes your query using reliable sources and databases to provide accurate insights.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start bg-gray-50 rounded-2xl p-4">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-4 mt-1 shadow-sm">
                <Text className="text-white font-pbold text-base">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-lg mb-2">Get Verified Results</Text>
                <Text className="text-gray-800 font-pregular text-base leading-6">
                  Receive detailed information with reliable sources and contextual explanations.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Disclaimer */}
        <View className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-5 mb-8 border-l-4 border-amber-500 shadow-sm">
          <Text className="text-amber-900 font-psemibold text-lg mb-3">Important Notice</Text>
          <Text className="text-amber-800 font-pregular text-base leading-6">
            Our AI provides preliminary analysis for general information. 
            All critical information is reviewed by qualified experts. 
            CRECO is not a substitute for professional advice where required.
          </Text>
        </View>

        {/* Mission */}
        <View className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 border-l-4 border-gray-500">
          <Text className="text-gray-900 text-xl font-pbold mb-3">Our Mission</Text>
          <Text className="text-gray-800 font-pregular text-base leading-7">
            To strengthen communities by providing citizens with reliable information, 
            civic awareness, and educational resources through AI-powered verification 
            and community engagement.
          </Text>
        </View>

        {/* Version */}
        <View className="items-center mt-4 bg-gray-100 rounded-2xl py-4">
          <Text className="text-gray-700 font-pregular text-sm text-center">
            CRECO Civic Platform v1.0.0
          </Text>
          <Text className="text-gray-600 font-pregular text-xs text-center mt-2">
            Building informed communities through technology
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutAppScreen;