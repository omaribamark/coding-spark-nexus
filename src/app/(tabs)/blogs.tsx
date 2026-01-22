import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { blogService } from '@/services/blogService';
import { shareService } from '@/services/shareService';
import { useTheme } from '@/context/ThemeContext';
import { formatDateTime } from '@/utils/dateFormatter';

const BlogsTab = () => {
  const router = useRouter();
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
      const data = await blogService.getAllBlogs();
      
      if (!data || !Array.isArray(data)) {
        setBlogs([]);
        return;
      }
      
      const sortedBlogs = data.sort((a: any, b: any) => {
        const dateA = new Date(a.published_at || a.created_at || a.publishDate || a.publishedAt);
        const dateB = new Date(b.published_at || b.created_at || b.publishDate || b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setBlogs(sortedBlogs);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch blogs';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const remainingBlogs = blogs.length > 1 ? blogs.slice(1) : [];

  const getAuthorName = (blog: any) => {
    return blog.author_name || blog.author_email || blog.author?.full_name || blog.author?.username || blog.author || 'Hakikisha Team';
  };

  const getCategory = (blog: any) => {
    return blog.category || 'General';
  };

  const getExcerpt = (blog: any) => {
    return blog.excerpt || blog.summary || blog.content?.substring(0, 150) + '...' || 'Read more...';
  };

  const handleShareBlog = (blog: any) => {
    Alert.alert(
      'Share Blog',
      'Choose how to share',
      [
        { text: 'WhatsApp', onPress: async () => { try { await shareService.shareToWhatsApp(blog); } catch (error: any) { Alert.alert('Error', error.message); } } },
        { text: 'Facebook', onPress: async () => { try { await shareService.shareToFacebook(blog); } catch (error: any) { Alert.alert('Error', error.message); } } },
        { text: 'Twitter', onPress: async () => { try { await shareService.shareToTwitter(blog); } catch (error: any) { Alert.alert('Error', error.message); } } },
        { text: 'More Options', onPress: async () => { try { await shareService.shareBlog(blog); } catch (error: any) { Alert.alert('Error', error.message); } } },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const navigateToBlogDetail = (blog: any) => {
    router.push({ pathname: '/blog-detail', params: { blogId: blog.id } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff', paddingTop: insets.top }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#FFFFFF"} translucent />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {error && (
          <View style={{ marginHorizontal: 24, marginTop: 16, padding: 16, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12 }}>
            <Text style={{ color: '#991B1B', fontWeight: '500', fontSize: 14, marginBottom: 8 }}>Failed to load blogs</Text>
            <Text style={{ color: '#DC2626', fontSize: 12, marginBottom: 12 }}>{error}</Text>
            <TouchableOpacity onPress={fetchBlogs} style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#B91C1C', fontWeight: '600', fontSize: 14 }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {loading && (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0A864D" />
            <Text style={{ marginTop: 8, color: isDark ? '#9CA3AF' : '#4B5563' }}>Loading blogs...</Text>
          </View>
        )}
        
        {/* Featured Banner */}
        {featuredBlog && !loading && (
          <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
            <TouchableOpacity
              style={{ backgroundColor: '#0A864D', borderRadius: 16, overflow: 'hidden' }}
              onPress={() => navigateToBlogDetail(featuredBlog)}>
              
              {featuredBlog.featured_image && (
                <View style={{ width: '100%', height: 192, backgroundColor: '#1F2937' }}>
                  <Image source={{ uri: featuredBlog.featured_image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>
              )}
              
              <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✨ Featured</Text>
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' }}>
                    {formatDateTime(featuredBlog.published_at || featuredBlog.created_at)}
                  </Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8, lineHeight: 24 }}>
                  {featuredBlog.title}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
                  {getExcerpt(featuredBlog)}
                </Text>
                <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' }}>
                  <Text style={{ color: '#0A864D', fontWeight: '600', fontSize: 14 }}>Read Now →</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Blog List */}
        {!loading && blogs.length > 0 && (
          <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#fff' : '#111827' }}>Latest Articles</Text>
              <Text style={{ color: '#0A864D', fontWeight: '500', fontSize: 14 }}>{blogs.length} articles</Text>
            </View>
            
            {remainingBlogs.map((item, index) => (
              <TouchableOpacity 
                key={item.id || index} 
                style={{ backgroundColor: isDark ? '#1F2937' : '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: isDark ? '#374151' : '#F3F4F6' }}
                onPress={() => navigateToBlogDetail(item)}
              >
                {item.featured_image && (
                  <View style={{ width: '100%', height: 160, backgroundColor: '#E5E7EB' }}>
                    <Image source={{ uri: item.featured_image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </View>
                )}

                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ backgroundColor: '#0A864D', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{getCategory(item)}</Text>
                      </View>
                      <Text style={{ color: '#9CA3AF', fontSize: 12, marginLeft: 8 }}>• {formatDateTime(item.published_at || item.created_at)}</Text>
                    </View>
                  </View>

                  <Text style={{ color: isDark ? '#fff' : '#111827', fontWeight: '700', fontSize: 16, marginBottom: 8, lineHeight: 20 }}>
                    {item.title}
                  </Text>

                  <Text style={{ color: isDark ? '#D1D5DB' : '#4B5563', fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
                    {getExcerpt(item)}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{ width: 24, height: 24, backgroundColor: isDark ? '#374151' : '#E5E7EB', borderRadius: 12, marginRight: 8 }} />
                      <Text style={{ color: isDark ? '#D1D5DB' : '#374151', fontSize: 12, fontWeight: '500', flex: 1 }}>{getAuthorName(item)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleShareBlog(item)} style={{ marginLeft: 8, padding: 8 }}>
                      <Text style={{ color: '#0A864D', fontSize: 18 }}>🔗</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Empty State */}
        {blogs.length === 0 && !loading && !error && (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
            <View style={{ width: 64, height: 64, backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 24 }}>📝</Text>
            </View>
            <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>No articles available yet</Text>
            <Text style={{ color: isDark ? '#4B5563' : '#9CA3AF', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>Check back later for updates</Text>
            <TouchableOpacity onPress={fetchBlogs} style={{ backgroundColor: '#0A864D', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BlogsTab;
