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
      // Hakikisha support email
      const emailData = {
        to: 'hakikisha@creco.org',
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
          <Text className="text-white text-2xl font-pbold flex-1">About Hakikisha</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 py-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 30}}
      >
        {/* What is Hakikisha */}
        <View className="mb-8 bg-blue-50 rounded-2xl p-5 border-l-4 border-blue-500">
          <Text className="text-blue-800 text-xl font-pbold mb-3">What is Hakikisha?</Text>
          <Text className="text-gray-800 font-pregular text-base leading-7">
            Hakikisha is a platform for information verification and presentation of findings 
            digitally through a mobile application while leveraging Artificial Intelligence 
            to verify user-generated claims.
          </Text>
        </View>

        {/* Our Mission */}
        <View className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 border-l-4 border-gray-500">
          <Text className="text-gray-900 text-xl font-pbold mb-3">Our Mission</Text>
          <Text className="text-gray-800 font-pregular text-base leading-7">
            To strengthen democratic participation by promoting civic understanding, 
            legal awareness, and active community involvement.
          </Text>
        </View>

        {/* Focus Areas */}
        <View className="mb-8">
          <Text className="text-gray-900 text-xl font-pbold mb-4">Focus Areas</Text>

          <View className="space-y-4">
            {/* Civic Education */}
            <View className="bg-blue-100 rounded-2xl p-5 border-l-4 border-blue-600 shadow-sm">
              <Text className="text-blue-900 font-psemibold text-lg mb-3">Civic Education</Text>
              <Text className="text-gray-800 font-pregular text-base leading-6">
                Through educational content and verified explanations, we support informed 
                participation in public affairs.
              </Text>
            </View>

            {/* Legal Awareness */}
            <View className="bg-purple-100 rounded-2xl p-5 border-l-4 border-purple-600 shadow-sm">
              <Text className="text-purple-900 font-psemibold text-lg mb-3">Legal Awareness and Constitutionalism</Text>
              <Text className="text-gray-800 font-pregular text-base leading-6">
                The app provides simplified legal knowledge to help users understand the 
                Constitution, key laws, and important public policies.
              </Text>
            </View>

            {/* Community Engagement */}
            <View className="bg-green-100 rounded-2xl p-5 border-l-4 border-green-600 shadow-sm">
              <Text className="text-green-900 font-psemibold text-lg mb-3">Community Engagement</Text>
              <Text className="text-gray-800 font-pregular text-base leading-6">
                Hakikisha fosters an informed and active community by encouraging users to 
                engage, report concerns, ask questions, and access fact-checked information 
                on matters affecting them.
              </Text>
            </View>
          </View>
        </View>

        {/* Key Features */}
        <View className="mb-8">
          <Text className="text-gray-900 text-xl font-pbold mb-4">Key Features</Text>

          {/* Blogs */}
          <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-4 border-l-4 border-indigo-500 shadow-sm">
            <Text className="text-indigo-900 font-psemibold text-lg mb-3">Blogs</Text>
            <Text className="text-gray-800 font-pregular text-base leading-6">
              Stay informed with well-researched articles covering governance, public policy, 
              constitutional issues, and trending topics.
            </Text>
          </View>

          {/* Submission of Claims */}
          <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-4 border-l-4 border-emerald-500 shadow-sm">
            <Text className="text-emerald-900 font-psemibold text-lg mb-3">Submission of Claims</Text>
            <Text className="text-gray-800 font-pregular text-base leading-6">
              Users can submit suspicious information, news, or claims directly through the 
              app for verification. This feature empowers the community to take an active 
              role in combating misinformation.
            </Text>
          </View>

          {/* AI Assistant */}
          <View className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-4 border-l-4 border-orange-500 shadow-sm">
            <Text className="text-orange-900 font-psemibold text-lg mb-3">AI Assistant</Text>
            <Text className="text-gray-800 font-pregular text-base leading-6">
              Hakikisha integrates an advanced AI assistant that quickly analyzes user queries, 
              conducts real-time web searches, and provides reliable summaries from credible sources.
            </Text>
          </View>

          {/* Human Fact-checking Verdicts */}
          <View className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 mb-4 border-l-4 border-pink-500 shadow-sm">
            <Text className="text-pink-900 font-psemibold text-lg mb-3">Human Fact-checking Verdicts</Text>
            <Text className="text-gray-800 font-pregular text-base leading-6">
              All verified claims receive a final review by trained human fact-checkers. This ensures 
              accuracy, objectivity, and adherence to professional fact-checking standards.
            </Text>
          </View>
        </View>

        {/* Fact-Checking Process */}
        <View className="mb-8">
          <Text className="text-gray-900 text-xl font-pbold mb-4">Fact-Checking Process</Text>

          <View className="space-y-4">
            <View className="flex-row items-start bg-gray-50 rounded-2xl p-4">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-4 mt-1 shadow-sm">
                <Text className="text-white font-pbold text-base">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-lg mb-2">Selection of Claim</Text>
                <Text className="text-gray-800 font-pregular text-base leading-6">
                  Claims are gathered from submissions via Hakikisha app, news reports, social media 
                  narratives, and online trends based on public importance and potential harm.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start bg-gray-50 rounded-2xl p-4">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-4 mt-1 shadow-sm">
                <Text className="text-white font-pbold text-base">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-lg mb-2">Research & Evidence Gathering</Text>
                <Text className="text-gray-800 font-pregular text-base leading-6">
                  Gathering primary and secondary evidence from official data sources, academic reports, 
                  credible media, and expert interviews.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start bg-gray-50 rounded-2xl p-4">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-4 mt-1 shadow-sm">
                <Text className="text-white font-pbold text-base">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-lg mb-2">Analysis & Verification</Text>
                <Text className="text-gray-800 font-pregular text-base leading-6">
                  Cross-checking multiple sources using data analysis tools, reverse image searches, 
                  and other verification methods to determine accuracy.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start bg-gray-50 rounded-2xl p-4">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-4 mt-1 shadow-sm">
                <Text className="text-white font-pbold text-base">4</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-lg mb-2">Verdict</Text>
                <Text className="text-gray-800 font-pregular text-base leading-6">
                  After reviewing all evidence, claims are categorized as True, False, Misleading, 
                  or Unverifiable.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start bg-gray-50 rounded-2xl p-4">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-4 mt-1 shadow-sm">
                <Text className="text-white font-pbold text-base">5</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-lg mb-2">Publication</Text>
                <Text className="text-gray-800 font-pregular text-base leading-6">
                  Findings are published in accessible format with original claim, sources used, 
                  clear explanation, and links in the Hakikisha App.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Important Information */}
        <View className="mb-8">
          <Text className="text-gray-900 text-xl font-pbold mb-4">Important Information</Text>

          {/* Free Service */}
          <View className="bg-green-100 rounded-2xl p-5 mb-4 border-l-4 border-green-600">
            <Text className="text-green-900 font-psemibold text-lg mb-3">Free Service</Text>
            <Text className="text-green-800 font-pregular text-base leading-6">
              Fact-checking is completely free of charge for all users.
            </Text>
          </View>

          {/* Data Privacy */}
          <View className="bg-blue-100 rounded-2xl p-5 mb-4 border-l-4 border-blue-600">
            <Text className="text-blue-900 font-psemibold text-lg mb-3">Data Privacy</Text>
            <Text className="text-blue-800 font-pregular text-base leading-6">
              We value our users' data privacy and operate within the Data Protection Act jurisdiction. 
              Personal data is only used for authentication and Hakikisha-related purposes.
            </Text>
          </View>

          {/* Availability */}
          <View className="bg-purple-100 rounded-2xl p-5 mb-4 border-l-4 border-purple-600">
            <Text className="text-purple-900 font-psemibold text-lg mb-3">Platform Availability</Text>
            <Text className="text-purple-800 font-pregular text-base leading-6">
              Hakikisha mobile app is available on both Android and iOS through Google Play Store 
              and App Store respectively.
            </Text>
          </View>

          {/* Query Submission */}
          <View className="bg-amber-100 rounded-2xl p-5 mb-4 border-l-4 border-amber-600">
            <Text className="text-amber-900 font-psemibold text-lg mb-3">Query Submission</Text>
            <Text className="text-amber-800 font-pregular text-base leading-6">
              Users can submit queries through the Hakikisha mobile application as text, image, 
              or link format. We also accept scanned copies of letters for verification.
            </Text>
          </View>
        </View>

        {/* AI Disclaimer */}
        <View className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-5 mb-8 border-l-4 border-amber-500 shadow-sm">
          <Text className="text-amber-900 font-psemibold text-lg mb-3">Scope of Fact-Checking</Text>
          <Text className="text-amber-800 font-pregular text-base leading-6">
            We accept queries regarding civic processes, elections, governance, leadership, 
            accountability, civil societies engagement, human rights awareness, and constitutionalism. 
            All claims are verified against credible sources and receive human review.
          </Text>
        </View>

        {/* Version */}
        <View className="items-center mt-4 bg-gray-100 rounded-2xl py-4">
          <Text className="text-gray-700 font-pregular text-sm text-center">
            Hakikisha Fact Check Unit
          </Text>
          <Text className="text-gray-600 font-pregular text-xs text-center mt-2">
            Building informed communities through verified information
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutAppScreen;