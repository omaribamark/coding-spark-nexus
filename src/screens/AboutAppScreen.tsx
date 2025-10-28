import {View, Text, ScrollView, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {icons} from '../constants';

type Props = {};

const AboutAppScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gradient-to-r from-green-500 to-green-600 pt-12 pb-6 px-6">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Image
              source={icons.arrow_right}
              className="w-6 h-6 rotate-180"
              tintColor="white"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-pbold flex-1">About CRECO</Text>
        </View>
        <Text className="text-green-100 font-pregular text-sm">
          Your AI-powered fact-checking platform
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6 py-6" 
        showsVerticalScrollIndicator={false}
      >
        {/* What is CRECO */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-3xl mr-3">🎯</Text>
            <Text className="text-xl font-pbold text-gray-900">What is CRECO?</Text>
          </View>
          <Text className="text-gray-700 font-pregular text-base leading-6">
            CRECO (Civic Rights and Election Compliance Organization) is an AI-powered fact-checking platform 
            designed to combat misinformation and promote informed decision-making. We verify claims, 
            analyze statements, and provide reliable information to help you navigate the information landscape.
          </Text>
        </View>

        {/* Key Features */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl mr-3">✨</Text>
            <Text className="text-xl font-pbold text-gray-900">Key Features</Text>
          </View>

          {/* Feature 1 */}
          <View className="bg-green-50 rounded-2xl p-4 mb-3 border border-green-100">
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">🤖</Text>
              <Text className="text-lg font-psemibold text-gray-900">AI Fact-Checker</Text>
            </View>
            <Text className="text-gray-700 font-pregular text-sm leading-5">
              Chat with our AI assistant to verify claims instantly. Upload images, documents, 
              or simply ask questions to get accurate fact-checking results powered by advanced AI.
            </Text>
          </View>

          {/* Feature 2 */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-3 border border-blue-100">
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">📋</Text>
              <Text className="text-lg font-psemibold text-gray-900">Claims Database</Text>
            </View>
            <Text className="text-gray-700 font-pregular text-sm leading-5">
              Browse verified claims from our extensive database. View detailed fact-checking 
              reports, sources, and verdicts from our team of professional fact-checkers.
            </Text>
          </View>

          {/* Feature 3 */}
          <View className="bg-purple-50 rounded-2xl p-4 mb-3 border border-purple-100">
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">📰</Text>
              <Text className="text-lg font-psemibold text-gray-900">Educational Blogs</Text>
            </View>
            <Text className="text-gray-700 font-pregular text-sm leading-5">
              Read articles and guides about media literacy, how to spot misinformation, 
              and best practices for verifying information in the digital age.
            </Text>
          </View>

          {/* Feature 4 */}
          <View className="bg-orange-50 rounded-2xl p-4 mb-3 border border-orange-100">
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">🏆</Text>
              <Text className="text-lg font-psemibold text-gray-900">Gamification & Rewards</Text>
            </View>
            <Text className="text-gray-700 font-pregular text-sm leading-5">
              Earn points and maintain streaks by engaging with the app daily. Submit claims, 
              verify information, and contribute to a more informed community.
            </Text>
          </View>
        </View>

        {/* How It Works */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl mr-3">⚙️</Text>
            <Text className="text-xl font-pbold text-gray-900">How It Works</Text>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-pbold text-sm">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-base mb-1">Submit or Browse Claims</Text>
                <Text className="text-gray-700 font-pregular text-sm">
                  Enter a claim you want to verify or browse our database of already verified claims.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-pbold text-sm">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-base mb-1">AI Analysis</Text>
                <Text className="text-gray-700 font-pregular text-sm">
                  Our AI assistant analyzes the claim using multiple sources and provides an initial assessment.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-pbold text-sm">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-base mb-1">Professional Review</Text>
                <Text className="text-gray-700 font-pregular text-sm">
                  Our fact-checking team verifies the AI analysis and provides a detailed report with sources.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-pbold text-sm">4</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-psemibold text-base mb-1">Get Results</Text>
                <Text className="text-gray-700 font-pregular text-sm">
                  Receive a verdict (True, False, Misleading, etc.) with detailed explanations and sources.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Disclaimer */}
        <View className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-200">
          <View className="flex-row items-start">
            <Text className="text-amber-600 text-2xl mr-3">⚠️</Text>
            <View className="flex-1">
              <Text className="text-amber-900 font-psemibold text-base mb-2">Important Notice</Text>
              <Text className="text-amber-800 font-pregular text-sm leading-5">
                While our AI provides instant preliminary analysis, all final verdicts are reviewed 
                by professional fact-checkers. AI-generated responses may contain errors. CRECO is 
                not responsible for implications of AI responses. Always verify critical information 
                through multiple reliable sources.
              </Text>
            </View>
          </View>
        </View>

        {/* Mission */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-3xl mr-3">🌟</Text>
            <Text className="text-xl font-pbold text-gray-900">Our Mission</Text>
          </View>
          <Text className="text-gray-700 font-pregular text-base leading-6">
            To empower citizens with accurate information and promote media literacy, 
            enabling informed decision-making and strengthening democratic participation 
            through reliable fact-checking and transparency.
          </Text>
        </View>

        {/* Contact */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">📧</Text>
            <Text className="text-lg font-psemibold text-gray-900">Get in Touch</Text>
          </View>
          <Text className="text-gray-700 font-pregular text-sm leading-5">
            Have questions or feedback? We'd love to hear from you!
          </Text>
          <Text className="text-green-600 font-pmedium text-sm mt-2">
            support@creco.org
          </Text>
        </View>

        {/* Version */}
        <Text className="text-gray-400 font-pregular text-xs text-center mb-4">
          CRECO v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

export default AboutAppScreen;
