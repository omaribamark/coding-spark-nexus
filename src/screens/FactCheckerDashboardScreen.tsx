import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {icons} from '../constants';

type Props = {};

type Claim = {
  id: string;
  title: string;
  description: string;
  category: string;
  submittedBy: string;
  submittedDate: string;
  imageUrl?: string;
  videoLink?: string;
  sourceLink?: string;
  aiSuggestion?: {
    status: 'verified' | 'false' | 'misleading' | 'needs_context';
    verdict: string;
    confidence: number;
    sources: string[];
  };
};

type FactCheckerStats = {
  totalVerified: number;
  pendingReview: number;
  timeSpent: string;
  accuracy: string;
};

type Blog = {
  id: string;
  title: string;
  category: string;
  content: string;
  publishedBy: string;
  publishDate: string;
  status?: string;
};

// API base URL - adjust based on your environment
const API_BASE_URL = 'https://hakikisha-backend.onrender.com/api/v1';

// Token storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

const FactCheckerDashboardScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<'pending' | 'ai-suggestions' | 'stats' | 'blogs'>('pending');
  const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<Claim[]>([]);
  const [stats, setStats] = useState<FactCheckerStats>({
    totalVerified: 0,
    pendingReview: 0,
    timeSpent: '0 hours',
    accuracy: '0%',
  });
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [verdictForm, setVerdictForm] = useState({
    status: 'verified' as 'verified' | 'false' | 'misleading' | 'needs_context',
    verdict: '',
    sources: '',
  });
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Governance',
    content: '',
  });
  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([]);
  const [selectedStat, setSelectedStat] = useState<string>('');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Proper token management
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        console.error('No auth token found in storage');
        setAuthError(true);
        return null;
      }
      
      // Validate token format (basic check)
      if (token === 'your-auth-token' || token.length < 10) {
        console.error('Invalid token format');
        setAuthError(true);
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      setAuthError(true);
      return null;
    }
  };

  // Check if user is authenticated on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(
        'Authentication Required',
        'Please login again to continue',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }
  };

  // Enhanced API call helper with better error handling
  const apiCall = async (endpoint: string, options: any = {}) => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not available');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log(`API response status: ${response.status}`);

      // Handle unauthorized response
      if (response.status === 401) {
        console.error('Authentication failed - invalid token');
        await handleAuthFailure();
        throw new Error('Authentication failed');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} - ${errorText}`);
        
        // Try to parse error as JSON
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log(`API call successful: ${endpoint}`);
      return responseData;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('API call timeout:', endpoint);
        throw new Error('Request timeout - please check your connection');
      }
      
      console.error('API call failed:', error);
      
      if (error.message === 'Authentication failed') {
        throw error; // Re-throw auth errors
      }
      
      // Check for network errors
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        throw new Error('Network error - please check your internet connection');
      }
      
      throw error; // Re-throw the original error
    }
  };

  const handleAuthFailure = async () => {
    try {
      // Clear stored tokens
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      setAuthError(true);
      
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please login again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error('Error during auth cleanup:', error);
    }
  };

  useEffect(() => {
    if (!authError) {
      loadDashboardData();
    }
  }, [activeTab, authError]);

  const loadDashboardData = async () => {
    if (authError) return;
    
    setLoading(true);
    try {
      // Load data based on active tab
      switch (activeTab) {
        case 'pending':
          await loadPendingClaims();
          break;
        case 'ai-suggestions':
          await loadAiSuggestions();
          break;
        case 'stats':
          await loadStats();
          break;
        case 'blogs':
          await loadBlogs();
          break;
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      
      if (error.message.includes('Authentication') || error.message === 'Authentication failed') {
        await handleAuthFailure();
      } else if (!error.message.includes('Network error')) {
        // Only show alert for non-network errors
        Alert.alert('Error', error.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Fixed loadPendingClaims function
  const loadPendingClaims = async () => {
    try {
      const data = await apiCall('/fact-checker/pending-claims');
      console.log('Pending claims response:', data);
      
      // Ensure we have an array and map properties correctly
      const claims = data.claims || data.data?.claims || [];
      
      // Transform data to ensure consistent property names
      const transformedClaims = claims.map((claim: any) => ({
        id: claim.id || claim.claim_id,
        title: claim.title || claim.claim_title || 'No Title',
        description: claim.description || claim.claim_description || '',
        category: claim.category || 'general',
        submittedBy: claim.submittedBy || claim.submitterEmail || claim.user_email || 'Unknown',
        submittedDate: claim.submittedDate || claim.created_at || new Date().toISOString().split('T')[0],
        imageUrl: claim.imageUrl || claim.media_url,
        videoLink: claim.videoLink || (claim.media_type === 'video' ? claim.media_url : null),
        sourceLink: claim.sourceLink
      }));
      
      console.log(`Loaded ${transformedClaims.length} pending claims`);
      setPendingClaims(transformedClaims);
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('Error loading pending claims:', error);
        setPendingClaims([]);
      }
      throw error;
    }
  };

  // Fixed loadAiSuggestions function
  const loadAiSuggestions = async () => {
    try {
      const data = await apiCall('/fact-checker/ai-suggestions');
      console.log('AI suggestions response:', data);
      
      // Ensure we have an array and map properties correctly
      const claims = data.claims || data.data?.claims || [];
      
      const transformedClaims = claims.map((claim: any) => ({
        id: claim.id || claim.claim_id,
        title: claim.title || claim.claim_title || 'No Title',
        description: claim.description || claim.claim_description || '',
        category: claim.category || 'general',
        submittedBy: claim.submittedBy || claim.submitterEmail || 'Unknown',
        submittedDate: claim.submittedDate || claim.created_at || new Date().toISOString().split('T')[0],
        aiSuggestion: {
          status: claim.aiSuggestion?.status || claim.ai_suggestion?.verdict || 'needs_context',
          verdict: claim.aiSuggestion?.verdict || claim.ai_suggestion?.explanation || 'No AI analysis available',
          confidence: claim.aiSuggestion?.confidence || claim.ai_suggestion?.confidence || 0.5,
          sources: claim.aiSuggestion?.sources || claim.ai_suggestion?.sources || []
        }
      }));
      
      console.log(`Loaded ${transformedClaims.length} AI suggestions`);
      setAiSuggestions(transformedClaims);
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('Error loading AI suggestions:', error);
        setAiSuggestions([]);
      }
      throw error;
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiCall('/fact-checker/stats');
      console.log('Stats response:', data);
      
      setStats({
        totalVerified: data.stats?.totalVerified || data.totalVerified || 0,
        pendingReview: data.stats?.pendingReview || data.pendingReview || 0,
        timeSpent: data.stats?.timeSpent || data.timeSpent || '0 hours',
        accuracy: data.stats?.accuracy || data.accuracy || '0%',
      });
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('Error loading stats:', error);
        // Keep current stats or default values
      }
      throw error;
    }
  };

  // FIXED: Load blogs function with proper endpoint handling
  const loadBlogs = async () => {
    try {
      console.log('Loading blogs...');
      
      let data;
      
      // Try the correct endpoint first
      try {
        data = await apiCall('/blogs');
        console.log('Blogs response:', data);
      } catch (error) {
        console.log('Blogs endpoint failed:', error);
        // If main blogs endpoint fails, try to get from fact-checker endpoint
        try {
          data = await apiCall('/fact-checker/blogs');
          console.log('Fact-checker blogs response:', data);
        } catch (fallbackError) {
          console.log('All blog endpoints failed:', fallbackError);
          throw new Error('Unable to load blogs at this time');
        }
      }
      
      // Handle different response structures
      const blogs = data.data || data.blogs || data || [];
      
      console.log(`Raw blogs data count:`, blogs.length);
      
      // Filter only published blogs for display and ensure they have required fields
      const publishedBlogs = blogs
        .filter((blog: any) => !blog.status || blog.status === 'published') // Include if no status or published
        .map((blog: any) => ({
          id: blog.id || `blog-${Date.now()}-${Math.random()}`,
          title: blog.title || 'Untitled Blog',
          category: blog.category || 'Governance',
          content: blog.content || blog.excerpt || 'No content available',
          publishedBy: blog.author_name || blog.author_email || blog.author_id || 'Fact Checker',
          publishDate: blog.published_at || blog.created_at || new Date().toISOString().split('T')[0],
          status: blog.status || 'published'
        }));
      
      console.log(`Filtered ${publishedBlogs.length} published blogs`);
      setPublishedBlogs(publishedBlogs);
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('Error loading blogs:', error);
        setPublishedBlogs([]);
        
        // Don't show alert for blogs loading error to avoid spam
        if (!error.message.includes('Network error')) {
          console.log('Blogs loading failed:', error.message);
        }
      }
      throw error;
    }
  };

  // FIXED: Publish blog function with better error handling
  const handlePublishBlog = async () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      Alert.alert('Error', 'Please fill title and content fields');
      return;
    }

    setLoading(true);
    try {
      const blogData = {
        title: blogForm.title.trim(),
        category: blogForm.category,
        content: blogForm.content.trim(),
        status: 'published' // Directly publish the blog
      };

      console.log('Publishing blog with data:', blogData);

      const response = await apiCall('/blogs', {
        method: 'POST',
        body: JSON.stringify(blogData),
      });

      console.log('Blog publication response:', response);

      // Create new blog object for local state
      const newBlog: Blog = {
        id: response.data?.id || response.blog?.id || `blog-${Date.now()}`,
        title: blogForm.title,
        category: blogForm.category,
        content: blogForm.content,
        publishedBy: response.data?.author_name || response.blog?.author_name || 'You',
        publishDate: response.data?.published_at || response.blog?.published_at || new Date().toISOString().split('T')[0],
      };

      // Add to local state immediately for better UX
      setPublishedBlogs(prev => [newBlog, ...prev]);
      Alert.alert('Success', 'Blog published successfully!');
      
      // Clear form
      setBlogForm({title: '', category: 'Governance', content: ''});
      
    } catch (error: any) {
      console.error('Error publishing blog:', error);
      if (!error.message.includes('Authentication')) {
        Alert.alert('Error', error.message || 'Failed to publish blog. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Submit verdict function
  const handleSubmitVerdict = async () => {
    if (!selectedClaim || !verdictForm.verdict.trim()) {
      Alert.alert('Error', 'Please provide a verdict explanation');
      return;
    }

    setLoading(true);
    try {
      const verdictData = {
        claimId: selectedClaim.id,
        verdict: verdictForm.status,
        explanation: verdictForm.verdict.trim(),
        sources: verdictForm.sources.split(',').map(s => s.trim()).filter(s => s),
        time_spent: 300 // 5 minutes default
      };

      console.log('Submitting verdict with data:', verdictData);

      const response = await apiCall('/fact-checker/submit-verdict', {
        method: 'POST',
        body: JSON.stringify(verdictData),
      });

      console.log('Verdict submission response:', response);

      Alert.alert('Success', 'Verdict submitted successfully and sent to user');
      
      // Remove the claim from pending list
      setPendingClaims(prev => prev.filter(claim => claim.id !== selectedClaim.id));
      
      setSelectedClaim(null);
      setVerdictForm({status: 'verified', verdict: '', sources: ''});
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalVerified: prev.totalVerified + 1,
        pendingReview: Math.max(0, prev.pendingReview - 1),
      }));
    } catch (error: any) {
      console.error('Error submitting verdict:', error);
      if (!error.message.includes('Authentication')) {
        Alert.alert('Error', error.message || 'Failed to submit verdict');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAiVerdict = async (claimId: string) => {
    setLoading(true);
    try {
      const response = await apiCall(`/fact-checker/approve-ai-verdict/${claimId}`, {
        method: 'POST',
      });

      Alert.alert('Success', 'AI verdict approved and sent to user');
      
      // Remove from AI suggestions list
      setAiSuggestions(prev => prev.filter(claim => claim.id !== claimId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalVerified: prev.totalVerified + 1,
      }));
    } catch (error: any) {
      console.error('Error approving AI verdict:', error);
      if (!error.message.includes('Authentication')) {
        Alert.alert('Error', error.message || 'Failed to approve AI verdict');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditAiVerdict = (claim: Claim) => {
    setSelectedClaim(claim);
    setVerdictForm({
      status: claim.aiSuggestion?.status || 'verified',
      verdict: claim.aiSuggestion?.verdict || '',
      sources: claim.aiSuggestion?.sources?.join(', ') || '',
    });
  };

  const handleLogout = async () => {
    try {
      // Clear stored tokens
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      
      // Optionally call logout API endpoint if available
      try {
        await apiCall('/auth/logout', { method: 'POST' });
      } catch (error) {
        console.log('Logout API call failed, continuing with local logout');
      }
      
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate to login even if cleanup fails
      navigation.navigate('Login');
    }
  };

  // Add authentication error state
  if (authError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg font-pmedium text-red-600 mb-4">
          Authentication Error
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-lg"
          style={{backgroundColor: '#0A864D'}}
          onPress={() => navigation.navigate('Login')}>
          <Text className="text-white font-pmedium">Return to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderPendingClaims = () => (
    <View className="pb-6">
      <Text className="text-xl font-pbold mb-4" style={{color: '#0A864D'}}>
        Pending Claims ({pendingClaims.length})
      </Text>
      {pendingClaims.length === 0 ? (
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-gray-500 text-center text-sm">
            No pending claims to review
          </Text>
        </View>
      ) : (
        pendingClaims.map(claim => (
          <View key={claim.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
            <View className="flex-row items-start mb-2">
              <View
                className="px-3 py-1 rounded-full mr-3"
                style={{backgroundColor: '#EF9334'}}>
                <Text className="text-white text-xs font-pmedium">{claim.category}</Text>
              </View>
            </View>
            
            <View className="mb-3">
              <Text className="font-psemibold text-base mb-2 text-gray-800">{claim.title}</Text>
              <Text className="text-gray-600 text-sm mb-2" numberOfLines={3}>
                {claim.description}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-xs mb-1">
                  Submitted by: {claim.submittedBy}
                </Text>
                <Text className="text-gray-500 text-xs">
                  Date: {claim.submittedDate}
                </Text>
              </View>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg"
                style={{backgroundColor: '#0A864D'}}
                onPress={() => {
                  setSelectedClaim(claim);
                  setVerdictForm({status: 'verified', verdict: '', sources: ''});
                }}>
                <Text className="text-white font-pmedium text-xs">Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderAiSuggestions = () => (
    <View className="pb-6">
      <Text className="text-xl font-pbold mb-4" style={{color: '#0A864D'}}>
        AI Suggested Verdicts ({aiSuggestions.length})
      </Text>
      {aiSuggestions.length === 0 ? (
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-gray-500 text-center text-sm">
            No AI suggestions available
          </Text>
        </View>
      ) : (
        aiSuggestions.map(claim => (
          <View key={claim.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
            <View className="flex-row items-start mb-3">
              <View
                className="px-3 py-1 rounded-full mr-3"
                style={{backgroundColor: '#EF9334'}}>
                <Text className="text-white text-xs font-pmedium">{claim.category}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-psemibold text-base mb-1">{claim.title}</Text>
                <View
                  className="px-3 py-1 rounded-full self-start mb-2"
                  style={{
                    backgroundColor:
                      claim.aiSuggestion?.status === 'verified'
                        ? '#0A864D'
                        : claim.aiSuggestion?.status === 'false'
                        ? '#dc2626'
                        : '#EF9334',
                  }}>
                  <Text className="text-white text-xs font-pmedium">
                    AI: {claim.aiSuggestion?.status?.toUpperCase() || 'UNKNOWN'}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-gray-700 text-sm mb-3">
              {claim.aiSuggestion?.verdict}
            </Text>

            {claim.aiSuggestion?.sources && claim.aiSuggestion.sources.length > 0 && (
              <View className="mb-3">
                <Text className="font-pmedium text-xs text-gray-600 mb-1">Sources:</Text>
                {claim.aiSuggestion.sources.map((source, idx) => (
                  <Text key={idx} className="text-xs text-blue-600 mb-1" numberOfLines={1}>
                    • {source}
                  </Text>
                ))}
              </View>
            )}

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 py-2 rounded-lg"
                style={{backgroundColor: '#0A864D'}}
                onPress={() => handleApproveAiVerdict(claim.id)}>
                <Text className="text-white font-pmedium text-center text-sm">Approve & Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-2 rounded-lg bg-gray-100"
                onPress={() => {
                  handleEditAiVerdict(claim);
                }}>
                <Text className="text-gray-700 font-pmedium text-center text-sm">Edit & Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderStats = () => (
    <View className="pb-6">
      <Text className="text-xl font-pbold mb-4" style={{color: '#0A864D'}}>
        Your Statistics
      </Text>
      <View className="flex-row flex-wrap">
        <TouchableOpacity 
          className="w-1/2 p-2"
          onPress={() => setSelectedStat('totalVerified')}>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-600 font-pregular mb-2">Total Verified</Text>
            <Text className="text-3xl font-pbold" style={{color: '#0A864D'}}>
              {stats.totalVerified}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="w-1/2 p-2"
          onPress={() => setSelectedStat('pendingReview')}>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-600 font-pregular mb-2">Pending Review</Text>
            <Text className="text-3xl font-pbold" style={{color: '#EF9334'}}>
              {stats.pendingReview}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="w-1/2 p-2"
          onPress={() => setSelectedStat('timeSpent')}>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-600 font-pregular mb-2">Time Spent</Text>
            <Text className="text-xl font-pbold text-gray-800">{stats.timeSpent}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="w-1/2 p-2"
          onPress={() => setSelectedStat('accuracy')}>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-600 font-pregular mb-2">Accuracy</Text>
            <Text className="text-3xl font-pbold" style={{color: '#0A864D'}}>
              {stats.accuracy}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Stat Details Modal */}
      <Modal
        visible={!!selectedStat}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedStat('')}>
        <View className="flex-1 justify-center bg-black/50 p-6">
          <View className="bg-white rounded-2xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-pbold" style={{color: '#0A864D'}}>
                {selectedStat === 'totalVerified' && 'Total Verified Details'}
                {selectedStat === 'pendingReview' && 'Pending Review Details'}
                {selectedStat === 'timeSpent' && 'Time Spent Analysis'}
                {selectedStat === 'accuracy' && 'Accuracy Breakdown'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedStat('')}>
                <Text className="text-gray-600 text-2xl">×</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-gray-700 mb-4">
              {selectedStat === 'totalVerified' && `You have successfully verified ${stats.totalVerified} claims. This includes various categories like Governance, Misinformation, and Civic Process.`}
              {selectedStat === 'pendingReview' && `You currently have ${stats.pendingReview} claims awaiting your review. These will be processed based on priority and submission date.`}
              {selectedStat === 'timeSpent' && `You have spent ${stats.timeSpent} on fact-checking activities. This includes reviewing claims, researching sources, and writing verdicts.`}
              {selectedStat === 'accuracy' && `Your fact-checking accuracy is ${stats.accuracy}. This is calculated based on the correctness of your verdicts compared to community feedback and expert reviews.`}
            </Text>

            <TouchableOpacity
              className="py-3 rounded-lg mt-4"
              style={{backgroundColor: '#0A864D'}}
              onPress={() => setSelectedStat('')}>
              <Text className="text-white text-center font-pbold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderBlogs = () => (
    <View className="pb-6">
      <Text className="text-xl font-pbold mb-4" style={{color: '#0A864D'}}>
        Write Blog Article
      </Text>
      
      <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <Text className="font-pmedium mb-2 text-gray-800">Title *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-2 mb-4 text-gray-800"
          placeholder="Enter blog title..."
          placeholderTextColor="#9CA3AF"
          value={blogForm.title}
          onChangeText={text => setBlogForm({...blogForm, title: text})}
        />

        <Text className="font-pmedium mb-2 text-gray-800">Category</Text>
        <View className="mb-4">
          <View className="flex-row justify-between bg-orange-50 rounded-lg p-1">
            {['Governance', 'Misinformation', 'Civic Process'].map(cat => (
              <TouchableOpacity
                key={cat}
                className="flex-1 mx-1 py-2 rounded-md"
                style={{
                  backgroundColor: blogForm.category === cat ? '#EF9334' : 'transparent',
                }}
                onPress={() => setBlogForm({...blogForm, category: cat})}>
                <Text
                  className="text-center font-pmedium text-[10px]"
                  style={{color: blogForm.category === cat ? 'white' : '#666'}}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text className="font-pmedium mb-2 text-gray-800">Content *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
          placeholder="Write your blog content here..."
          placeholderTextColor="#9CA3AF"
          value={blogForm.content}
          onChangeText={text => setBlogForm({...blogForm, content: text})}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          style={{minHeight: 150}}
        />

        <TouchableOpacity
          className="py-3 rounded-lg"
          style={{backgroundColor: '#0A864D'}}
          onPress={handlePublishBlog}
          disabled={loading || !blogForm.title.trim() || !blogForm.content.trim()}>
          <Text className="text-white text-center font-pbold">
            {loading ? 'Publishing...' : 'Publish Blog'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-lg font-psemibold mb-3" style={{color: '#0A864D'}}>
        Your Published Blogs ({publishedBlogs.length})
      </Text>
      
      {publishedBlogs.length > 0 ? (
        publishedBlogs.map(blog => (
          <TouchableOpacity 
            key={blog.id} 
            className="bg-white rounded-2xl p-4 shadow-sm mb-3"
            onPress={() => setSelectedBlog(blog)}>
            <View className="flex-row items-start mb-2">
              <View className="px-3 py-1 rounded-full mr-3" style={{backgroundColor: '#EF9334'}}>
                <Text className="text-white text-[10px] font-pmedium">{blog.category}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-psemibold text-base mb-2">{blog.title}</Text>
              </View>
            </View>
            
            <Text className="text-gray-600 text-sm mb-2" numberOfLines={3}>
              {blog.content}
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500 text-xs">
                Published by: {blog.publishedBy}
              </Text>
              <Text className="text-gray-500 text-xs">{blog.publishDate}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-gray-500 text-center text-sm">
            No blogs published yet. Write your first blog above!
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Logout */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-white border-b border-gray-200 mt-8">
        <Text className="text-xl font-pbold" style={{color: '#0A864D'}}>
          Fact Checker Dashboard
        </Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="px-3 py-1 rounded-lg border border-red-500">
          <Text className="text-red-500 font-pmedium text-sm">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="flex-1 mx-1 py-2 rounded-lg"
            style={{backgroundColor: activeTab === 'pending' ? '#0A864D' : '#f3f4f6'}}
            onPress={() => setActiveTab('pending')}>
            <Text
              className="text-center font-pmedium text-sm"
              style={{color: activeTab === 'pending' ? 'white' : '#666'}}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 mx-1 py-2 rounded-lg"
            style={{backgroundColor: activeTab === 'ai-suggestions' ? '#0A864D' : '#f3f4f6'}}
            onPress={() => setActiveTab('ai-suggestions')}>
            <Text
              className="text-center font-pmedium text-sm"
              style={{color: activeTab === 'ai-suggestions' ? 'white' : '#666'}}>
              AI Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 mx-1 py-2 rounded-lg"
            style={{backgroundColor: activeTab === 'stats' ? '#0A864D' : '#f3f4f6'}}
            onPress={() => setActiveTab('stats')}>
            <Text
              className="text-center font-pmedium text-sm"
              style={{color: activeTab === 'stats' ? 'white' : '#666'}}>
              Statistics
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 mx-1 py-2 rounded-lg"
            style={{backgroundColor: activeTab === 'blogs' ? '#0A864D' : '#f3f4f6'}}
            onPress={() => setActiveTab('blogs')}>
            <Text
              className="text-center font-pmedium text-sm"
              style={{color: activeTab === 'blogs' ? 'white' : '#666'}}>
              Blogs
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6 py-6"
        contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0A864D']}
            tintColor="#0A864D"
          />
        }>
        {activeTab === 'pending' && renderPendingClaims()}
        {activeTab === 'ai-suggestions' && renderAiSuggestions()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'blogs' && renderBlogs()}
      </ScrollView>

      {/* Review Claim Modal - Full Screen */}
      <Modal
        visible={selectedClaim !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedClaim(null)}>
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200 bg-white">
            <Text className="text-xl font-pbold" style={{color: '#0A864D'}}>
              Review Claim
            </Text>
            <TouchableOpacity 
              onPress={() => setSelectedClaim(null)}
              className="p-2">
              <Text className="text-gray-600 text-2xl">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1 p-6"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{paddingBottom: 30}}>
            {selectedClaim && (
              <>
                {/* Claim Details */}
                <View className="mb-6">
                  <Text className="text-lg font-pbold mb-3 text-gray-800">
                    Claim Details
                  </Text>
                  
                  <View className="flex-row items-center mb-3">
                    <View
                      className="px-3 py-1 rounded-full mr-3"
                      style={{backgroundColor: '#EF9334'}}>
                      <Text className="text-white text-xs font-pmedium">{selectedClaim.category}</Text>
                    </View>
                    <Text className="text-gray-500 text-xs">
                      Submitted: {selectedClaim.submittedDate}
                    </Text>
                  </View>

                  <Text className="font-psemibold text-base mb-2 text-gray-800">
                    {selectedClaim.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-4">
                    {selectedClaim.description}
                  </Text>

                  <View className="mb-4">
                    <Text className="font-pmedium text-xs text-gray-600 mb-1">Submitted by:</Text>
                    <Text className="text-xs text-gray-800">{selectedClaim.submittedBy}</Text>
                  </View>

                  {selectedClaim.videoLink && (
                    <View className="mb-2">
                      <Text className="font-pmedium text-xs text-gray-600 mb-1">Video Link:</Text>
                      <Text className="text-xs text-blue-600">{selectedClaim.videoLink}</Text>
                    </View>
                  )}
                  
                  {selectedClaim.sourceLink && (
                    <View className="mb-4">
                      <Text className="font-pmedium text-xs text-gray-600 mb-1">Source Link:</Text>
                      <Text className="text-xs text-blue-600">{selectedClaim.sourceLink}</Text>
                    </View>
                  )}
                </View>

                {/* Verdict Form */}
                <View className="mb-6">
                  <Text className="text-lg font-pbold mb-3 text-gray-800">
                    Your Verdict
                  </Text>

                  <Text className="font-pmedium mb-2 text-gray-800">Status</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {[
                      {value: 'verified', label: 'VERIFIED', color: '#0A864D'},
                      {value: 'false', label: 'FALSE', color: '#dc2626'},
                      {value: 'misleading', label: 'MISLEADING', color: '#EF9334'},
                      {value: 'needs_context', label: 'NEEDS CONTEXT', color: '#3b82f6'}
                    ].map((status) => (
                      <TouchableOpacity
                        key={status.value}
                        className="px-3 py-2 rounded-lg"
                        style={{
                          backgroundColor: verdictForm.status === status.value ? status.color : '#f3f4f6',
                        }}
                        onPress={() =>
                          setVerdictForm({
                            ...verdictForm,
                            status: status.value as any,
                          })
                        }>
                        <Text
                          className="font-pmedium text-xs"
                          style={{
                            color: verdictForm.status === status.value ? 'white' : '#666',
                          }}>
                          {status.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="font-pmedium mb-2 text-gray-800">Verdict Details *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
                    placeholder="Write your detailed verdict here... Explain why you reached this conclusion and provide context."
                    placeholderTextColor="#9CA3AF"
                    value={verdictForm.verdict}
                    onChangeText={text => setVerdictForm({...verdictForm, verdict: text})}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    style={{minHeight: 120}}
                  />

                  <Text className="font-pmedium mb-2 text-gray-800">Sources (comma separated)</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-2 text-gray-800"
                    placeholder="https://reliable-source1.com, https://reliable-source2.com"
                    placeholderTextColor="#9CA3AF"
                    value={verdictForm.sources}
                    onChangeText={text => setVerdictForm({...verdictForm, sources: text})}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <Text className="text-xs text-gray-500 mb-4">
                    Provide reliable sources that support your verdict
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mb-6">
                  <TouchableOpacity
                    className="flex-1 py-2 rounded-lg border border-gray-300"
                    onPress={() => setSelectedClaim(null)}
                    disabled={loading}>
                    <Text className="text-gray-700 text-center font-pmedium text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-2 rounded-lg"
                    style={{backgroundColor: '#0A864D'}}
                    onPress={handleSubmitVerdict}
                    disabled={loading || !verdictForm.verdict.trim()}>
                    <Text className="text-white text-center font-pmedium text-sm">
                      {loading ? 'Submitting...' : 'Submit Verdict'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Blog View Modal - Full Screen */}
      <Modal
        visible={selectedBlog !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedBlog(null)}>
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
            <Text className="text-xl font-pbold" style={{color: '#0A864D'}}>
              View Blog
            </Text>
            <TouchableOpacity onPress={() => setSelectedBlog(null)}>
              <Text className="text-gray-600 text-2xl">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1 p-6"
            showsVerticalScrollIndicator={true}>
            {selectedBlog && (
              <>
                <View className="flex-row items-start mb-4">
                  <View className="px-3 py-1 rounded-full mr-3" style={{backgroundColor: '#EF9334'}}>
                    <Text className="text-white text-[10px] font-pmedium">{selectedBlog.category}</Text>
                  </View>
                  <Text className="text-gray-500 text-xs mt-1">
                    {selectedBlog.publishDate}
                  </Text>
                </View>

                <Text className="text-2xl font-pbold mb-4 text-gray-800">
                  {selectedBlog.title}
                </Text>

                <Text className="text-gray-700 text-base leading-6 mb-6">
                  {selectedBlog.content}
                </Text>

                <Text className="text-gray-500 text-sm">
                  Published by: {selectedBlog.publishedBy}
                </Text>

                <TouchableOpacity
                  className="py-3 rounded-lg mt-6"
                  style={{backgroundColor: '#0A864D'}}
                  onPress={() => setSelectedBlog(null)}>
                  <Text className="text-white text-center font-pbold">Close</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default FactCheckerDashboardScreen;