import {View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {blogService} from '../services/blogService';
import {shareService} from '../services/shareService';
import {icons} from '../constants';
import { useTheme } from '../context/ThemeContext';
import { formatDateTime } from '../utils/dateFormatter';

type Props = {};

const BlogsTab = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('BlogsTab: Starting to fetch blogs...');
      const data = await blogService.getAllBlogs();
      console.log('BlogsTab: Received data from service:', data);
      console.log('BlogsTab: Data type:', typeof data);
      console.log('BlogsTab: Is array?', Array.isArray(data));
      
      // Ensure we have an array
      if (!data) {
        console.warn('BlogsTab: No data received from service');
        setBlogs([]);
        return;
      }
      
      if (!Array.isArray(data)) {
        console.warn('BlogsTab: Data is not an array:', data);
        setBlogs([]);
        return;
      }
      
      console.log(`BlogsTab: Processing ${data.length} blogs`);
      
      // Sort blogs by published date (newest first)
      const sortedBlogs = data.sort((a: any, b: any) => {
        const dateA = new Date(a.published_at || a.created_at || a.publishDate || a.publishedAt);
        const dateB = new Date(b.published_at || b.created_at || b.publishDate || b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('📱 BlogsTab: Setting blogs state with', sortedBlogs.length, 'blogs');
      setBlogs(sortedBlogs);
      
    } catch (error: any) {
      console.error('📱 BlogsTab: Error fetching blogs:', error);
      const errorMessage = error?.message || 'Failed to fetch blogs';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get the latest blog for featured section
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  // Get remaining blogs for the list (excluding the featured one)
  const remainingBlogs = blogs.length > 1 ? blogs.slice(1) : [];


  const getAuthorName = (blog: any) => {
    return blog.author_name || 
           blog.author_email || 
           blog.author?.full_name || 
           blog.author?.username ||
           blog.author ||
           'Hakikisha Team';
  };

  const getCategory = (blog: any) => {
    return blog.category || 'General';
  };

  const getExcerpt = (blog: any) => {
    return blog.excerpt || 
           blog.summary || 
           blog.content?.substring(0, 150) + '...' || 
           'Read more...';
  };

  const handleShareBlog = (blog: any) => {
    Alert.alert(
      'Share Blog',
      'Choose how to share',
      [
        {
          text: 'WhatsApp',
          onPress: async () => {
            try {
              await shareService.shareToWhatsApp(blog);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
        {
          text: 'Facebook',
          onPress: async () => {
            try {
              await shareService.shareToFacebook(blog);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
        {
          text: 'Twitter',
          onPress: async () => {
            try {
              await shareService.shareToTwitter(blog);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
        {
          text: 'More Options',
          onPress: async () => {
            try {
              await shareService.shareBlog(blog);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRetry = () => {
    fetchBlogs();
  };

  const navigateToBlogDetail = (blog: any) => {
    navigation.navigate('BlogDetail', { blog });
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`} style={{paddingTop: insets.top}}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#FFFFFF"} translucent />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: insets.bottom + 20}}>
        {/* Error State */}
        {error && (
          <View className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <Text className="text-red-800 font-pmedium text-sm mb-2">
              Failed to load blogs
            </Text>
            <Text className="text-red-600 font-pregular text-xs mb-3">
              {error}
            </Text>
            <TouchableOpacity
              onPress={handleRetry}
              className="bg-red-100 px-4 py-2 rounded-lg self-start"
            >
              <Text className="text-red-700 font-psemibold text-sm">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {loading && (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#0A864D" />
            <Text className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'} font-pregular`}>
              Loading blogs...
            </Text>
          </View>
        )}
        
        {/* Featured Banner - Latest Blog */}
        {featuredBlog && !loading && (
          <View className="px-6 py-5">
            <TouchableOpacity
              style={{
                backgroundColor: '#0A864D',
                shadowColor: '#0A864D',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              className="rounded-2xl overflow-hidden"
              onPress={() => navigateToBlogDetail(featuredBlog)}>
              
              {/* Featured Image or Video */}
              {(featuredBlog.featured_image || featuredBlog.video_url) && (
                <View className="w-full h-48 bg-gray-800">
                  {featuredBlog.featured_image ? (
                    <Image 
                      source={{ uri: featuredBlog.featured_image }} 
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : featuredBlog.video_url && (
                    <View className="w-full h-full items-center justify-center bg-black/50">
                      <Text className="text-white text-4xl mb-2">▶️</Text>
                      <Text className="text-white text-xs font-pmedium">Video Content</Text>
                    </View>
                  )}
                </View>
              )}
              
              <View className="p-5">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-pbold">✨ Featured</Text>
                  </View>
                  <Text className="text-white/80 text-xs font-pmedium">
                    {formatDateTime(featuredBlog.published_at || featuredBlog.created_at)}
                  </Text>
                </View>
                <Text className="text-white text-xl font-pbold mb-2 leading-6">
                  {featuredBlog.title}
                </Text>
                <Text className="text-white/90 font-pregular text-sm mb-4 leading-5">
                  {getExcerpt(featuredBlog)}
                </Text>
                <View className="bg-white px-4 py-2.5 rounded-xl self-start shadow-sm">
                  <Text style={{color: '#0A864D'}} className="font-psemibold text-sm">
                    Read Now →
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Blog List - Latest Articles */}
        {!loading && blogs.length > 0 && (
          <View className="px-6 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-lg font-psemibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Latest Articles
              </Text>
              <Text className="text-[#0A864D] font-pmedium text-sm">
                {blogs.length} {blogs.length === 1 ? 'article' : 'articles'}
              </Text>
            </View>
            
            {remainingBlogs.map((item, index) => (
              <TouchableOpacity 
                key={item.id || index} 
                className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl overflow-hidden mb-3 shadow-sm border`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
                onPress={() => navigateToBlogDetail(item)}
              >
                {/* Featured Image or Video Thumbnail */}
                {(item.featured_image || item.video_url) && (
                  <View className="w-full h-40 bg-gray-200">
                    {item.featured_image ? (
                      <Image 
                        source={{ uri: item.featured_image }} 
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : item.video_url && (
                      <View className="w-full h-full items-center justify-center bg-gray-300">
                        <Text className="text-gray-600 text-3xl mb-1">▶️</Text>
                        <Text className="text-gray-600 text-xs font-pmedium">Video</Text>
                      </View>
                    )}
                  </View>
                )}

                <View className="p-4">
                  {/* Category & Date */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View 
                        style={{backgroundColor: '#0A864D'}}
                        className="px-3 py-1 rounded-full"
                      >
                        <Text className="text-white text-xs font-psemibold">
                          {getCategory(item)}
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-xs font-pregular ml-2">
                        • {formatDateTime(item.published_at || item.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text className={`${isDark ? 'text-white' : 'text-gray-900'} font-pbold text-base mb-2 leading-5`}>
                    {item.title}
                  </Text>

                  {/* Excerpt */}
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-pregular text-sm mb-4 leading-5`}>
                    {getExcerpt(item)}
                  </Text>

                  {/* Author & Share */}
                  <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <View className="flex-row items-center flex-1">
                      <View className={`w-6 h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mr-2`} />
                      <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-xs font-pmedium flex-1`}>
                        {getAuthorName(item)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleShareBlog(item)}
                      className="ml-2 p-2"
                    >
                      <Text className="text-[#0A864D] text-lg">🔗</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Empty State */}
        {blogs.length === 0 && !loading && !error && (
          <View className="items-center justify-center py-12 px-6">
            <View className={`w-16 h-16 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full items-center justify-center mb-3`}>
              <Text className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-2xl`}>📝</Text>
            </View>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-pregular text-sm text-center mb-2`}>
              No articles available yet
            </Text>
            <Text className={`${isDark ? 'text-gray-600' : 'text-gray-400'} font-pregular text-xs text-center mb-4`}>
              Check back later for updates
            </Text>
            <TouchableOpacity
              onPress={handleRetry}
              className="bg-[#0A864D] px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-psemibold text-sm">
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BlogsTab;