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
  Linking,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {icons} from '../constants';
import { RichTextRenderer } from '../components';

// FIXED: Updated dateFormatter functions with proper timezone handling
const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    // Use UTC methods to avoid timezone conversion
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Date error';
  }
};

// NEW: Format date only (without time) for all submitted dates
const formatDateOnly = (dateString: string): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    // Use UTC methods to get consistent date display
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date only:', error, dateString);
    return 'Date error';
  }
};

// FIXED: Added specific formatter for blogs that shows local time
const formatBlogDateTime = (dateString: string): string => {
  if (!dateString) return 'Just now';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid blog date string:', dateString);
      // Return current time as fallback
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    // Use local time for blogs to show actual publishing time in user's timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting blog date:', error, dateString);
    // Return current time as fallback
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
};

type Props = {};

type Claim = {
  id: string;
  title: string;
  description: string;
  category: string;
  submittedBy: string;
  submittedByEmail: string;
  submittedDate: string;
  imageUrl?: string;
  videoLink?: string;
  sourceLink?: string;
  aiSuggestion?: {
    status: 'verified' | 'false' | 'misleading' | 'needs_context';
    verdict: string;
    confidence: number;
    sources: string[];
    analyzedAt?: string;
  };
};

type FactCheckerStats = {
  totalVerified: number;
  pendingReview: number;
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
  featured_image?: string;
  video_url?: string;
};

// API base URL - adjust based on your environment
const API_BASE_URL = 'https://hakikisha-backend-0r1w.onrender.com/api/v1';

// Token storage keys - FIXED: Added refresh token key
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

// FIXED: Enhanced token management functions
const AuthStorage = {
  // Store all auth data
  setAuthData: async (token: string, refreshToken: string, user: any) => {
    try {
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [REFRESH_TOKEN_KEY, refreshToken],
        [USER_DATA_KEY, JSON.stringify(user)]
      ]);
      console.log('✅ Auth data stored successfully');
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      throw error;
    }
  },

  // Get auth token
  getAuthToken: async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      console.log('🔑 Retrieved auth token:', token ? 'Yes' : 'No');
      return token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  },

  // Get refresh token
  getRefreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      console.log('🔄 Retrieved refresh token:', refreshToken ? 'Yes' : 'No');
      return refreshToken;
    } catch (error) {
      console.error('❌ Error getting refresh token:', error);
      return null;
    }
  },

  // Get user data
  getUserData: async (): Promise<any> => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  },

  // Clear all auth data
  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AuthStorage.getAuthToken();
    return !!token;
  }
};

const FactCheckerDashboardScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<'pending' | 'ai-suggestions' | 'stats' | 'blogs'>('pending');
  const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<Claim[]>([]);
  const [expandedPendingClaims, setExpandedPendingClaims] = useState<Set<string>>(new Set());
  const [expandedAiClaims, setExpandedAiClaims] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<FactCheckerStats>({
    totalVerified: 0,
    pendingReview: 0,
    accuracy: '0%',
  });
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [verdictForm, setVerdictForm] = useState({
    status: 'verified' as 'verified' | 'false' | 'misleading' | 'needs_context',
    verdict: '',
    sources: '',
    image_url: '',
  });
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Governance',
    content: '',
    featured_image: '',
    video_url: '',
  });
  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([]);
  const [selectedStat, setSelectedStat] = useState<string>('');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Debug function to see claim structure
  const debugClaimStructure = (claim: any, type: string) => {
    console.log(`=== ${type.toUpperCase()} CLAIM STRUCTURE DEBUG ===`);
    console.log('Claim ID:', claim.id);
    
    // Check all possible user fields
    const userFields = ['submittedBy', 'user', 'submitted_by', 'user_email', 'user_name', 'username'];
    userFields.forEach(field => {
      console.log(`${field}:`, claim[field], 'type:', typeof claim[field]);
    });
    
    console.log('Full claim object:', JSON.stringify(claim, null, 2));
    console.log(`=== END ${type.toUpperCase()} DEBUG ===`);
  };

  // Enhanced user information extraction
  const extractUserInfo = (claim: any) => {
    let userEmail = 'Unknown Email';
    let userName = 'Unknown User';
    
    // Try multiple possible structures in order of priority
    if (typeof claim.submittedBy === 'string' && claim.submittedBy.includes('@')) {
      // submittedBy is an email string like "me@gmail.com"
      userEmail = claim.submittedBy;
      userName = claim.submittedBy.split('@')[0]; // Use the part before @ as username
    } else if (claim.user && typeof claim.user === 'object') {
      // User is an object
      userEmail = claim.user.email || claim.user.user_email || 'Unknown Email';
      userName = claim.user.full_name || claim.user.name || claim.user.username || userEmail;
    } else if (claim.submitted_by && typeof claim.submitted_by === 'object') {
      // submitted_by is an object (common in some APIs)
      userEmail = claim.submitted_by.email || claim.submitted_by.user_email || 'Unknown Email';
      userName = claim.submitted_by.full_name || claim.submitted_by.name || claim.submitted_by.username || userEmail;
    } else if (typeof claim.user_email === 'string' && claim.user_email.includes('@')) {
      // user_email is a string email
      userEmail = claim.user_email;
      userName = claim.user_name || claim.username || userEmail.split('@')[0];
    } else if (claim.user && typeof claim.user === 'string' && claim.user.includes('@')) {
      // user is a string email
      userEmail = claim.user;
      userName = claim.user.split('@')[0];
    } else if (typeof claim.submittedBy === 'string') {
      // submittedBy is some other string (use as username)
      userName = claim.submittedBy;
    }
    
    return { userEmail, userName };
  };

  // FIXED: Enhanced token management with refresh capability
  const getAuthToken = async (): Promise<string | null> => {
    try {
      let token = await AuthStorage.getAuthToken();
      
      if (!token) {
        console.error('❌ No auth token found in storage');
        setAuthError(true);
        return null;
      }
      
      // Validate token format (basic check)
      if (token === 'your-auth-token' || token.length < 10) {
        console.error('❌ Invalid token format');
        setAuthError(true);
        return null;
      }
      
      console.log('✅ Auth token retrieved successfully');
      return token;
    } catch (error) {
      console.error('❌ Error retrieving auth token:', error);
      setAuthError(true);
      return null;
    }
  };

  // FIXED: Enhanced API call helper with token refresh
  const apiCall = async (endpoint: string, options: any = {}) => {
    let token = await getAuthToken();
    
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
      console.log(`🌐 Making API call to: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log(`📊 API response status: ${response.status}`);

      // Handle unauthorized response - try to refresh token
      if (response.status === 401) {
        console.log('🔄 Token expired, attempting refresh...');
        const newToken = await refreshAuthToken();
        if (newToken) {
          // Retry the request with new token
          console.log('🔄 Retrying request with refreshed token...');
          config.headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...config,
            signal: controller.signal,
          });
          
          if (!retryResponse.ok) {
            throw new Error(`Retry failed: ${retryResponse.status}`);
          }
          
          const retryData = await retryResponse.json();
          return retryData;
        } else {
          await handleAuthFailure();
          throw new Error('Authentication failed - please login again');
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API error: ${response.status} - ${errorText}`);
        
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
      console.log(`✅ API call successful: ${endpoint}`);
      return responseData;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('⏰ API call timeout:', endpoint);
        throw new Error('Request timeout - please check your connection');
      }
      
      console.error('❌ API call failed:', error);
      
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

  // FIXED: Token refresh function
  const refreshAuthToken = async (): Promise<string | null> => {
    try {
      console.log('🔄 Attempting to refresh auth token...');
      
      const refreshToken = await AuthStorage.getRefreshToken();
      if (!refreshToken) {
        console.error('❌ No refresh token available');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error('❌ Token refresh failed:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.token) {
        console.log('✅ Token refreshed successfully');
        
        // Store the new token
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        
        // Store new refresh token if provided
        if (data.refreshToken) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }
        
        return data.token;
      } else {
        console.error('❌ Invalid refresh response:', data);
        return null;
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return null;
    }
  };

  const handleAuthFailure = async () => {
    try {
      console.log('🔒 Handling auth failure...');
      
      // Clear stored tokens
      await AuthStorage.clearAuthData();
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
      console.error('❌ Error during auth cleanup:', error);
    }
  };

  // FIXED: Enhanced authentication check on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setIsCheckingAuth(true);
      console.log('🔍 Checking authentication...');
      
      const isAuthenticated = await AuthStorage.isAuthenticated();
      const userData = await AuthStorage.getUserData();
      
      console.log('🔍 Auth check results:', {
        isAuthenticated,
        hasUserData: !!userData,
        userRole: userData?.role
      });
      
      if (!isAuthenticated || !userData) {
        console.log('❌ Not authenticated, redirecting to login...');
        setAuthError(true);
        return;
      }
      
      // Verify user is a fact checker
      if (userData.role !== 'fact_checker') {
        console.error('❌ User is not a fact checker:', userData.role);
        Alert.alert(
          'Access Denied',
          'This dashboard is for fact checkers only.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }
      
      console.log('✅ Authentication successful, loading dashboard data...');
      setAuthError(false);
      await loadDashboardData();
    } catch (error) {
      console.error('❌ Error during authentication check:', error);
      setAuthError(true);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    if (!authError && !isCheckingAuth) {
      loadDashboardData();
    }
  }, [activeTab, authError, isCheckingAuth]);

  const loadDashboardData = async () => {
    if (authError || isCheckingAuth) return;
    
    setLoading(true);
    try {
      console.log(`📊 Loading data for tab: ${activeTab}`);
      
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
      console.error('❌ Error loading dashboard data:', error);
      
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

  // Toggle pending claim expansion
  const togglePendingClaimExpansion = (claimId: string) => {
    setExpandedPendingClaims(prev => {
      const newSet = new Set(prev);
      if (newSet.has(claimId)) {
        newSet.delete(claimId);
      } else {
        newSet.add(claimId);
      }
      return newSet;
    });
  };

  // Toggle AI claim expansion
  const toggleAiClaimExpansion = (claimId: string) => {
    setExpandedAiClaims(prev => {
      const newSet = new Set(prev);
      if (newSet.has(claimId)) {
        newSet.delete(claimId);
      } else {
        newSet.add(claimId);
      }
      return newSet;
    });
  };

  // FIXED: Load pending claims with proper user information and links
  const loadPendingClaims = async () => {
    try {
      const data = await apiCall('/fact-checker/pending-claims');
      console.log('📋 Pending claims response:', JSON.stringify(data, null, 2));
      
      // Ensure we have an array and map properties correctly
      const claims = data.claims || data.data?.claims || data || [];
      
      // Transform data to ensure consistent property names and get user information
      const transformedClaims = claims.map((claim: any) => {
        console.log('🔍 Processing pending claim:', claim.id);
        
        // Use enhanced user extraction
        const { userEmail, userName } = extractUserInfo(claim);
        
        // FIXED: Extract links - handle null values properly
        const videoLink = claim.videoLink || claim.video_link || '';
        const sourceLink = claim.sourceLink || claim.source_link || '';
        const imageUrl = claim.imageUrl || claim.image_url || '';
        
        console.log('📝 Extracted pending claim data:', {
          id: claim.id,
          videoLink,
          sourceLink,
          imageUrl,
          userEmail,
          userName
        });
        
        return {
          id: claim.id || claim.claim_id,
          title: claim.title || claim.claim_title || 'No Title',
          description: claim.description || claim.claim_description || claim.claimText || '',
          category: claim.category || 'general',
          submittedBy: userName,
          submittedByEmail: userEmail,
          submittedDate: claim.submittedDate || claim.created_at || claim.submitted_date || new Date().toISOString(),
          imageUrl: imageUrl,
          videoLink: videoLink,
          sourceLink: sourceLink
        };
      });
      
      // Remove duplicates based on claim ID
      const uniqueClaims = transformedClaims.filter((claim: Claim, index: number, self: Claim[]) => 
        index === self.findIndex((c: Claim) => c.id === claim.id)
      );
      
      console.log(`✅ Loaded ${uniqueClaims.length} unique pending claims with links`);
      setPendingClaims(uniqueClaims);
      // Reset expanded states when new data loads
      setExpandedPendingClaims(new Set());
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('❌ Error loading pending claims:', error);
        setPendingClaims([]);
      }
      throw error;
    }
  };

  // FIXED: Load AI suggestions with proper user information and links
  const loadAiSuggestions = async () => {
    try {
      const data = await apiCall('/fact-checker/ai-suggestions');
      console.log('🤖 AI suggestions response:', JSON.stringify(data, null, 2));
      
      // Ensure we have an array and map properties correctly
      const claims = data.claims || data.data?.claims || data || [];
      
      const transformedClaims = claims.map((claim: any) => {
        console.log('🔍 Processing AI claim:', claim.id);
        
        // Debug the structure to see what's available
        debugClaimStructure(claim, 'AI');
        
        // Use enhanced user extraction
        const { userEmail, userName } = extractUserInfo(claim);
        
        // FIXED: Extract links - handle null values properly
        const videoLink = claim.videoLink || claim.video_link || '';
        const sourceLink = claim.sourceLink || claim.source_link || '';
        const imageUrl = claim.imageUrl || claim.image_url || '';
        
        console.log('📝 Extracted AI claim data:', {
          id: claim.id,
          videoLink,
          sourceLink,
          imageUrl,
          userEmail,
          userName
        });
        
        return {
          id: claim.id || claim.claim_id,
          title: claim.title || claim.claim_title || 'No Title',
          description: claim.description || claim.claim_description || claim.claimText || '',
          category: claim.category || 'general',
          submittedBy: userName,
          submittedByEmail: userEmail,
          submittedDate: claim.submittedDate || claim.created_at || claim.submitted_date || new Date().toISOString(),
          imageUrl: imageUrl,
          videoLink: videoLink,
          sourceLink: sourceLink,
          aiSuggestion: {
            status: claim.aiSuggestion?.status || claim.ai_suggestion?.verdict || 'needs_context',
            verdict: claim.aiSuggestion?.verdict || claim.ai_suggestion?.explanation || 'No AI analysis available',
            confidence: claim.aiSuggestion?.confidence || claim.ai_suggestion?.confidence || 0.5,
            sources: claim.aiSuggestion?.sources || claim.ai_suggestion?.sources || [],
            analyzedAt: claim.aiSuggestion?.analyzedAt || claim.ai_suggestion?.analyzed_at || claim.analyzed_at || new Date().toISOString()
          }
        };
      });
      
      // Remove duplicates based on claim ID
      const uniqueClaims = transformedClaims.filter((claim: Claim, index: number, self: Claim[]) => 
        index === self.findIndex((c: Claim) => c.id === claim.id)
      );
      
      console.log(`✅ Loaded ${uniqueClaims.length} unique AI suggestions with links`);
      setAiSuggestions(uniqueClaims);
      // Reset expanded states when new data loads
      setExpandedAiClaims(new Set());
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('❌ Error loading AI suggestions:', error);
        setAiSuggestions([]);
      }
      throw error;
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiCall('/fact-checker/stats');
      console.log('📈 Stats response:', data);
      
      setStats({
        totalVerified: data.stats?.totalVerified || data.totalVerified || 0,
        pendingReview: data.stats?.pendingReview || data.pendingReview || 0,
        accuracy: data.stats?.accuracy || data.accuracy || '0%',
      });
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('❌ Error loading stats:', error);
        // Keep current stats or default values
      }
      throw error;
    }
  };

  // FIXED: Load blogs function with proper date handling
  const loadBlogs = async () => {
    try {
      console.log('📝 Loading blogs...');
      
      let data;
      
      // Try the correct endpoint first
      try {
        data = await apiCall('/blogs');
        console.log('📝 Blogs response:', data);
      } catch (error) {
        console.log('📝 Blogs endpoint failed:', error);
        // If main blogs endpoint fails, try to get from fact-checker endpoint
        try {
          data = await apiCall('/fact-checker/blogs');
          console.log('📝 Fact-checker blogs response:', data);
        } catch (fallbackError) {
          console.log('📝 All blog endpoints failed:', fallbackError);
          throw new Error('Unable to load blogs at this time');
        }
      }
      
      // Handle different response structures
      const blogs = data.data || data.blogs || data || [];
      
      console.log(`📝 Raw blogs data count:`, blogs.length);
      
      // Filter only published blogs for display and ensure they have required fields
      const publishedBlogs = blogs
        .filter((blog: any) => !blog.status || blog.status === 'published') // Include if no status or published
        .map((blog: any) => {
          // Ensure we have a valid publish date
          let publishDate = blog.published_at || blog.created_at || blog.publish_date;
          
          // If no valid date found or date is invalid, use current date
          if (!publishDate || isNaN(new Date(publishDate).getTime())) {
            publishDate = new Date().toISOString();
            console.log('📅 Using current date for blog:', blog.id || blog.title);
          }
          
          return {
            id: blog.id || `blog-${Date.now()}-${Math.random()}`,
            title: blog.title || 'Untitled Blog',
            category: blog.category || 'Governance',
            content: blog.content || blog.excerpt || 'No content available',
            publishedBy: blog.author_name || blog.author_email || blog.author_id || 'Fact Checker',
            publishDate: publishDate,
            status: blog.status || 'published',
            featured_image: blog.featured_image || undefined,
            video_url: blog.video_url || undefined,
          };
        });
      
      console.log(`✅ Filtered ${publishedBlogs.length} published blogs`);
      setPublishedBlogs(publishedBlogs);
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('❌ Error loading blogs:', error);
        setPublishedBlogs([]);
        
        // Don't show alert for blogs loading error to avoid spam
        if (!error.message.includes('Network error')) {
          console.log('📝 Blogs loading failed:', error.message);
        }
      }
      throw error;
    }
  };

  // FIXED: Publish blog function with proper date handling
  const handlePublishBlog = async () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      Alert.alert('Error', 'Please fill title and content fields');
      return;
    }

    setLoading(true);
    try {
      // Create current timestamp in correct format for the backend
      const currentDate = new Date().toISOString();
      
      const blogData = {
        title: blogForm.title.trim(),
        category: blogForm.category,
        content: blogForm.content.trim(),
        featured_image: blogForm.featured_image.trim() || null,
        video_url: blogForm.video_url.trim() || null,
        status: 'published', // Directly publish the blog
        published_at: currentDate, // Explicitly set publish date
        created_at: currentDate // Set creation date
      };

      console.log('📝 Publishing blog with data:', blogData);

      const response = await apiCall('/blogs', {
        method: 'POST',
        body: JSON.stringify(blogData),
      });

      console.log('📝 Blog publication response:', response);

      // Create new blog object for local state with proper date
      const newBlog: Blog = {
        id: response.data?.id || response.blog?.id || `blog-${Date.now()}`,
        title: blogForm.title,
        category: blogForm.category,
        content: blogForm.content,
        publishedBy: response.data?.author_name || response.blog?.author_name || 'You',
        // Use the date from response or current date as fallback
        publishDate: response.data?.published_at || response.blog?.published_at || currentDate,
        featured_image: blogForm.featured_image || undefined,
        video_url: blogForm.video_url || undefined,
      };

      // Add to local state immediately for better UX
      setPublishedBlogs(prev => [newBlog, ...prev]);
      Alert.alert('Success', 'Blog published successfully!');
      
      // Clear form
      setBlogForm({title: '', category: 'Governance', content: '', featured_image: '', video_url: ''});
      
    } catch (error: any) {
      console.error('❌ Error publishing blog:', error);
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
        image_url: verdictForm.image_url.trim() || undefined,
        time_spent: 300 // 5 minutes default
      };

      console.log('⚖️ Submitting verdict with data:', verdictData);

      const response = await apiCall('/fact-checker/submit-verdict', {
        method: 'POST',
        body: JSON.stringify(verdictData),
      });

      console.log('⚖️ Verdict submission response:', response);

      Alert.alert('Success', 'Verdict submitted successfully and sent to user');
      
      // Remove the claim from pending list
      setPendingClaims(prev => prev.filter(claim => claim.id !== selectedClaim.id));
      
      setSelectedClaim(null);
      setVerdictForm({status: 'verified', verdict: '', sources: '', image_url: ''});
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalVerified: prev.totalVerified + 1,
        pendingReview: Math.max(0, prev.pendingReview - 1),
      }));
    } catch (error: any) {
      console.error('❌ Error submitting verdict:', error);
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
      console.error('❌ Error approving AI verdict:', error);
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
      image_url: '',
    });
  };

  const getShortTopic = (text: string, wordCount: number = 7) => {
    if (!text) return 'No description available...';
    
    // Clean the text and split into words
    const words = text.trim().split(/\s+/);
    
    // Take the first 6-8 words
    if (words.length <= wordCount) {
      return text + (text.endsWith('.') ? '' : '...');
    }
    
    const shortText = words.slice(0, wordCount).join(' ');
    return shortText + '...';
  };

  // FIXED: Enhanced logout function
  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear stored tokens
      await AuthStorage.clearAuthData();
      
      // Optionally call logout API endpoint if available
      try {
        await apiCall('/auth/logout', { method: 'POST' });
      } catch (error) {
        console.log('📡 Logout API call failed, continuing with local logout');
      }
      
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still navigate to login even if cleanup fails
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  // Add loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className="text-lg font-pmedium text-gray-600 mt-4">
          Checking authentication...
        </Text>
      </View>
    );
  }

  // Add authentication error state
  if (authError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg font-pmedium text-red-600 mb-4">
          Authentication Required
        </Text>
        <Text className="text-gray-600 text-center mb-6 px-8">
          Please login again to access the Fact Checker Dashboard
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

  // ... rest of your render functions remain the same (renderPendingClaims, renderAiSuggestions, renderStats, renderBlogs)

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
        pendingClaims.map(claim => {
          const isExpanded = expandedPendingClaims.has(claim.id);
          const shortTopic = getShortTopic(claim.description);
          
          return (
            <View key={claim.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
              {/* Claim Header - Always Visible */}
              <TouchableOpacity 
                onPress={() => togglePendingClaimExpansion(claim.id)}
                className="flex-row items-start">
                <View className="flex-1">
                  {/* Short topic only - 6-8 words followed by ... */}
                  <Text className="text-gray-700 text-sm mb-2 leading-5">
                    {shortTopic}
                  </Text>
                  
                  {/* Metadata row */}
                  <View className="flex-row flex-wrap items-center gap-2 mb-1">
                    <Text className="text-gray-500 text-[10px]">
                      {/* FIXED: Using date-only format */}
                      Submitted: {formatDateOnly(claim.submittedDate)}
                    </Text>
                    <Text className="text-gray-500 text-[10px]">
                      By: {claim.submittedBy}
                    </Text>
                  </View>
                </View>
                
                {/* Dropdown arrow */}
                <View className="ml-2 pt-1">
                  <Text className={`text-lg text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Expandable Content */}
              {isExpanded && (
                <View className="border-t border-gray-200 pt-3 mt-3">
                  {/* Full claim details - Only show if title and description are different */}
                  {claim.title && claim.description && claim.title !== claim.description && (
                    <View className="mb-4">
                      <Text className="font-psemibold text-base mb-2 text-gray-800">Full Claim:</Text>
                      <Text className="text-gray-700 text-sm leading-5">
                        {claim.description}
                      </Text>
                    </View>
                  )}
                  
                  {/* Display Attached Image */}
                  {claim.imageUrl && (
                    <View className="mb-3">
                      <Text className="font-pmedium text-xs text-gray-600 mb-2">Attached Image:</Text>
                      <Image
                        source={{ uri: claim.imageUrl }}
                        className="w-full h-48 rounded-lg"
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  
                  {/* Display Video Link (Clickable) */}
                  {claim.videoLink && (
                    <View className="mb-3">
                      <Text className="font-pmedium text-xs text-gray-600 mb-1">Video Link:</Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (claim.videoLink && claim.videoLink.startsWith('http')) {
                            Linking.openURL(claim.videoLink).catch(() => {
                              Alert.alert('Error', 'Unable to open video link');
                            });
                          }
                        }}>
                        <Text className="text-xs text-blue-600 underline">{claim.videoLink}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Display Source Link (Clickable) */}
                  {claim.sourceLink && (
                    <View className="mb-3">
                      <Text className="font-pmedium text-xs text-gray-600 mb-1">Source Link:</Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (claim.sourceLink && claim.sourceLink.startsWith('http')) {
                            Linking.openURL(claim.sourceLink).catch(() => {
                              Alert.alert('Error', 'Unable to open source link');
                            });
                          }
                        }}>
                        <Text className="text-xs text-blue-600 underline">{claim.sourceLink}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* User Information */}
                  <View className="mb-3">
                    <Text className="font-pmedium text-xs text-gray-600 mb-1">Submitted by:</Text>
                    <Text className="text-xs text-gray-800">
                      {claim.submittedBy} {claim.submittedByEmail !== 'Unknown Email' ? `(${claim.submittedByEmail})` : ''}
                    </Text>
                  </View>

                  {/* Review Button */}
                  <TouchableOpacity
                    className="py-2 rounded-lg mt-2"
                    style={{backgroundColor: '#0A864D'}}
                    onPress={() => {
                      setSelectedClaim(claim);
                      setVerdictForm({status: 'verified', verdict: '', sources: '', image_url: ''});
                    }}>
                    <Text className="text-white font-pmedium text-center text-sm">Review & Submit Verdict</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
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
        aiSuggestions.map(claim => {
          const isExpanded = expandedAiClaims.has(claim.id);
          const shortTopic = getShortTopic(claim.description);
          
          return (
            <View key={claim.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
              {/* Claim Header - Always Visible */}
              <TouchableOpacity 
                onPress={() => toggleAiClaimExpansion(claim.id)}
                className="flex-row items-start">
                <View className="flex-1">
                  {/* Short topic only - 6-8 words followed by ... */}
                  <Text className="text-gray-700 text-sm mb-2 leading-5">
                    {shortTopic}
                  </Text>
                  
                  {/* Metadata row - REMOVED "Submitted by" from AI Stats */}
                  <View className="flex-row flex-wrap items-center gap-2 mb-1">
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          claim.aiSuggestion?.status === 'verified'
                            ? '#0A864D'
                            : claim.aiSuggestion?.status === 'false'
                            ? '#dc2626'
                            : '#EF9334',
                      }}>
                      <Text className="text-white text-[10px] font-pmedium">
                        {claim.aiSuggestion?.status?.toUpperCase() || 'UNKNOWN'}
                      </Text>
                    </View>
                    {/* UPDATED: Only show date and status, removed "By: {claim.submittedBy}" */}
                    <Text className="text-gray-500 text-[10px]">
                      Submitted: {formatDateOnly(claim.submittedDate)}
                    </Text>
                  </View>
                </View>
                
                {/* Dropdown arrow */}
                <View className="ml-2 pt-1">
                  <Text className={`text-lg text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Expandable Content */}
              {isExpanded && (
                <View className="border-t border-gray-200 pt-3 mt-3">
                  <View className="mb-3">
                    <Text className="font-psemibold text-gray-800 text-sm mb-2">AI Analysis:</Text>
                    <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <RichTextRenderer 
                        text={claim.aiSuggestion?.verdict || 'No AI analysis available'}
                        isDark={false}
                      />
                    </View>
                  </View>

                  {claim.aiSuggestion?.sources && claim.aiSuggestion.sources.length > 0 && (
                    <View className="mb-3">
                      <Text className="font-pmedium text-xs text-gray-600 mb-2">AI Sources:</Text>
                      {claim.aiSuggestion.sources.map((source, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => {
                            if (source && source.startsWith('http')) {
                              Linking.openURL(source).catch(() => {
                                Alert.alert('Error', 'Unable to open link');
                              });
                            }
                          }}
                          className="mb-1">
                          <Text className="text-xs text-blue-600 underline" numberOfLines={2}>
                            • {source}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* User Provided Links */}
                  <View className="mb-3">
                    <Text className="font-pmedium text-xs text-gray-600 mb-2">User Provided Links:</Text>
                    
                    {/* Video Link */}
                    {claim.videoLink && (
                      <TouchableOpacity
                        onPress={() => {
                          if (claim.videoLink && claim.videoLink.startsWith('http')) {
                            Linking.openURL(claim.videoLink).catch(() => {
                              Alert.alert('Error', 'Unable to open video link');
                            });
                          }
                        }}
                        className="mb-1">
                        <Text className="text-xs text-blue-600 underline" numberOfLines={2}>
                          • Video: {claim.videoLink}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {/* Source Link */}
                    {claim.sourceLink && (
                      <TouchableOpacity
                        onPress={() => {
                          if (claim.sourceLink && claim.sourceLink.startsWith('http')) {
                            Linking.openURL(claim.sourceLink).catch(() => {
                              Alert.alert('Error', 'Unable to open source link');
                            });
                          }
                        }}
                        className="mb-1">
                        <Text className="text-xs text-blue-600 underline" numberOfLines={2}>
                          • Source: {claim.sourceLink}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {!claim.videoLink && !claim.sourceLink && (
                      <Text className="text-xs text-gray-500">No links provided by user</Text>
                    )}
                  </View>

                  {/* REMOVED: User Information section from expanded view in AI Stats */}

                  {/* Confidence score */}
                  {claim.aiSuggestion?.confidence && (
                    <View className="mb-3">
                      <Text className="font-pmedium text-xs text-gray-600 mb-1">AI Confidence:</Text>
                      <View className="flex-row items-center">
                        <View className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <View 
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${(claim.aiSuggestion.confidence * 100)}%` }}
                          />
                        </View>
                        <Text className="text-xs text-gray-600">
                          {Math.round(claim.aiSuggestion.confidence * 100)}%
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View className="flex-row gap-2 mt-3">
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
              )}
            </View>
          );
        })
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
          onPress={() => setSelectedStat('accuracy')}>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-600 font-pregular mb-2">Accuracy</Text>
            <Text className="text-xl font-pbold text-gray-800">{stats.accuracy}</Text>
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
                {selectedStat === 'accuracy' && 'Accuracy Breakdown'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedStat('')}>
                <Text className="text-gray-600 text-2xl">×</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-gray-700 mb-4">
              {selectedStat === 'totalVerified' && `You have successfully verified ${stats.totalVerified} claims. This includes various categories like Governance, Misinformation, and Civic Process.`}
              {selectedStat === 'pendingReview' && `You currently have ${stats.pendingReview} claims awaiting your review. These will be processed based on priority and submission date.`}
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

        <Text className="font-pmedium mb-2 text-gray-800">Featured Image URL (Optional)</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-2 mb-4 text-gray-800"
          placeholder="https://example.com/image.jpg"
          placeholderTextColor="#9CA3AF"
          value={blogForm.featured_image}
          onChangeText={text => setBlogForm({...blogForm, featured_image: text})}
        />

        <Text className="font-pmedium mb-2 text-gray-800">Video URL (Optional)</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-2 mb-4 text-gray-800"
          placeholder="https://youtube.com/watch?v=..."
          placeholderTextColor="#9CA3AF"
          value={blogForm.video_url}
          onChangeText={text => setBlogForm({...blogForm, video_url: text})}
        />

        <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <View className="flex-row items-start">
            <Text className="text-amber-600 text-lg mr-2">💡</Text>
            <Text className="text-amber-800 font-pregular text-xs leading-4 flex-1">
              Add a featured image or video to make your blog more engaging!
            </Text>
          </View>
        </View>

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
            className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden"
            onPress={() => setSelectedBlog(blog)}>
            {/* Featured Image or Video Preview */}
            {(blog.featured_image || blog.video_url) && (
              <View className="w-full h-40 bg-gray-200">
                {blog.featured_image ? (
                  <Image 
                    source={{ uri: blog.featured_image }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : blog.video_url && (
                  <View className="w-full h-full items-center justify-center bg-gray-300">
                    <Text className="text-gray-600 text-3xl mb-1">▶️</Text>
                    <Text className="text-gray-600 text-xs font-pmedium">Video</Text>
                  </View>
                )}
              </View>
            )}
            
            <View className="p-4">
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
                <Text className="text-gray-500 text-xs">
                  {/* FIXED: Using local time for blogs to show correct publishing time */}
                  {formatBlogDateTime(blog.publishDate)}
                </Text>
              </View>
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
                      {/* FIXED: Using date-only format for modal */}
                      Submitted: {formatDateOnly(selectedClaim.submittedDate)}
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
                    {/* FIXED: Show user information properly */}
                    <Text className="text-xs text-gray-800">
                      {selectedClaim.submittedBy} {selectedClaim.submittedByEmail !== 'Unknown Email' ? `(${selectedClaim.submittedByEmail})` : ''}
                    </Text>
                  </View>

                  {/* User Provided Links in Modal */}
                  {selectedClaim.videoLink && (
                    <View className="mb-3">
                      <Text className="font-pmedium text-xs text-gray-600 mb-1">Video Link:</Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (selectedClaim.videoLink && selectedClaim.videoLink.startsWith('http')) {
                            Linking.openURL(selectedClaim.videoLink).catch(() => {
                              Alert.alert('Error', 'Unable to open video link');
                            });
                          }
                        }}>
                        <Text className="text-xs text-blue-600 underline">{selectedClaim.videoLink}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {selectedClaim.sourceLink && (
                    <View className="mb-4">
                      <Text className="font-pmedium text-xs text-gray-600 mb-1">Source Link:</Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (selectedClaim.sourceLink && selectedClaim.sourceLink.startsWith('http')) {
                            Linking.openURL(selectedClaim.sourceLink).catch(() => {
                              Alert.alert('Error', 'Unable to open source link');
                            });
                          }
                        }}>
                        <Text className="text-xs text-blue-600 underline">{selectedClaim.sourceLink}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedClaim.imageUrl && (
                    <View className="mb-4">
                      <Text className="font-pmedium text-xs text-gray-600 mb-1">Attached Image:</Text>
                      <Image
                        source={{ uri: selectedClaim.imageUrl }}
                        className="w-full h-48 rounded-lg"
                        resizeMode="cover"
                      />
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

                  <Text className="font-pmedium mb-2 text-gray-800">Evidence Image URL (Optional)</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-2 mb-2 text-gray-800"
                    placeholder="https://example.com/evidence-image.jpg"
                    placeholderTextColor="#9CA3AF"
                    value={verdictForm.image_url}
                    onChangeText={text => setVerdictForm({...verdictForm, image_url: text})}
                  />
                  <Text className="text-xs text-gray-500 mb-4">
                    Optional: Add an image URL to support your verdict
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
                    {/* FIXED: Using local time for blogs to show correct publishing time */}
                    {formatBlogDateTime(selectedBlog.publishDate)}
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