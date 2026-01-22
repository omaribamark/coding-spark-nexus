import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type Props = {};

const BlogDetailScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();
  const blog = (route.params as any)?.blog || {
    title: 'Blog Title',
    category: 'Category',
    content: 'Blog content will appear here...',
    author: 'Author',
    publishDate: 'Date',
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date Error';
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Minimal Header - Minimal padding */}
      <View className="pt-4 pb-1 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-8 h-8 justify-center items-center"
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Featured Image or Video */}
        {(blog.featured_image || blog.video_url) && (
          <View className="mb-4 -mx-6">
            {blog.featured_image ? (
              <Image 
                source={{ uri: blog.featured_image }} 
                className="w-full h-64"
                resizeMode="cover"
              />
            ) : blog.video_url && (
              <TouchableOpacity 
                onPress={() => Linking.openURL(blog.video_url)}
                className="w-full h-64 bg-gray-200 items-center justify-center"
              >
                <Text className="text-gray-600 text-5xl mb-2">▶️</Text>
                <Text className="text-gray-600 font-pmedium">Tap to watch video</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Title - Minimal margin */}
        <Text className="text-2xl font-pbold text-gray-900 mb-1">
          {blog.title}
        </Text>

        {/* Category and Author - Tight spacing */}
        <View className="flex-row items-center justify-between mb-4">
          {/* Category Badge */}
          <View
            className="px-3 py-1 rounded-full"
            style={{backgroundColor: '#EF9334'}}>
            <Text className="text-white text-xs font-psemibold">
              {blog.category}
            </Text>
          </View>
          
          {/* Author on far right */}
          <View className="flex-row items-center">
            <View className="w-5 h-5 bg-gray-200 rounded-full mr-1" />
            <Text className="text-gray-900 text-xs font-pmedium">
              {blog.author?.full_name || blog.author || 'Hakikisha Team'}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-3">
          <Text className="text-gray-800 font-pregular text-base leading-7">
            {blog.content}
          </Text>
        </View>

        {/* Date below content */}
        <View className="flex-row justify-end mb-4">
          <Text className="text-gray-500 text-xs font-pregular">
            Published: {formatDate(blog.published_at || blog.created_at || blog.publishDate)}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

export default BlogDetailScreen;