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
import * as ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {icons} from '../constants';
import { RichTextRenderer } from '../components';
import { blogService } from '../services/blogService';

// ==================== AUTHENTICATION CONFIGURATION ====================
// Storage keys - must match LoginScreen and other auth files
const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'user_data';

// Enhanced AuthStorage utility
const AuthStorage = {
  setAuthData: async (token: string, refreshToken: string, user: any) => {
    try {
      console.log('💾 Storing auth data...', {
        token: token ? 'Yes' : 'No',
        user: user ? user.role : 'No'
      });
      
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [REFRESH_TOKEN_KEY, refreshToken || ''],
        [USER_DATA_KEY, JSON.stringify(user)]
      ]);
      console.log('✅ Auth data stored successfully');
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      throw error;
    }
  },

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

  getRefreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      return refreshToken;
    } catch (error) {
      console.error('❌ Error getting refresh token:', error);
      return null;
    }
  },

  getUserData: async (): Promise<any> => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  },

  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AuthStorage.getAuthToken();
    const userData = await AuthStorage.getUserData();
    
    const isAuth = !!token && !!userData;
    console.log('🔐 Authentication check:', {
      hasToken: !!token,
      hasUserData: !!userData,
      userRole: userData?.role,
      isAuthenticated: isAuth
    });
    
    return isAuth;
  }
};

// Date formatting functions
const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
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

const formatDateOnly = (dateString: string): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date only:', error, dateString);
    return 'Date error';
  }
};

const formatBlogDateTime = (dateString: string): string => {
  if (!dateString) return 'Just now';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid blog date string:', dateString);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting blog date:', error, dateString);
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
  images?: string[];
  mediaUrl?: string;
  mediaType?: string;
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
};

const API_BASE_URL = 'https://hakikisha-backend-0r1w.onrender.com/api/v1';

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
    imageUri: null as string | null,
  });
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Governance',
    content: '',
    featured_image: '',
    featuredImageUri: null as string | null,
  });
  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([]);
  const [selectedStat, setSelectedStat] = useState<string>('');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ==================== AUTHENTICATION CHECK ====================
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setIsCheckingAuth(true);
      console.log('🔐 Starting fact checker authentication check...');
      
      const token = await AuthStorage.getAuthToken();
      const userData = await AuthStorage.getUserData();
      
      console.log('🔍 Fact Checker Auth Check Results:', {
        hasToken: !!token,
        hasUserData: !!userData,
        userRole: userData?.role,
        userEmail: userData?.email
      });
      
      if (!token || !userData) {
        console.log('❌ Not authenticated - missing token or user data');
        setAuthError(true);
        return;
      }
      
      // Check if user is actually a fact checker
      if (userData.role !== 'fact_checker') {
        console.error('❌ User is not a fact checker:', userData.role);
        Alert.alert(
          'Access Denied',
          'This dashboard is for fact checkers only.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        setAuthError(true);
        return;
      }
      
      console.log('✅ Fact Checker authenticated successfully:', {
        email: userData.email,
        role: userData.role,
        username: userData.username
      });
      
      setAuthError(false);
      await loadDashboardData();
      
    } catch (error) {
      console.error('❌ Error during authentication check:', error);
      setAuthError(true);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out fact checker...');
      await AuthStorage.clearAuthData();
      
      // Try API logout if possible, but continue anyway
      try {
        // You might want to add an API call here if your backend supports logout
        console.log('✅ Local auth data cleared');
      } catch (error) {
        console.log('ℹ️ API logout failed, continuing with local logout');
      }
      
      // Reset navigation to prevent going back
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Force navigation even if error
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  // ==================== API CALL FUNCTION ====================
  const apiCall = async (endpoint: string, options: any = {}) => {
    let token = await AuthStorage.getAuthToken();
    
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.status === 401) {
        console.log('🔄 Token expired, attempting refresh...');
        // You might want to implement token refresh logic here
        throw new Error('Session expired - please login again');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        
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
      return responseData;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      
      console.error('API call failed:', error);
      
      if (error.message === 'Session expired') {
        await handleAuthFailure();
      }
      
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        throw new Error('Network error - please check your internet connection');
      }
      
      throw error;
    }
  };

  const handleAuthFailure = async () => {
    try {
      console.log('🔐 Authentication failed, clearing data...');
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
      console.error('Error during auth cleanup:', error);
    }
  };

  // ==================== DASHBOARD DATA LOADING ====================
  useEffect(() => {
    if (!authError && !isCheckingAuth) {
      loadDashboardData();
    }
  }, [activeTab, authError, isCheckingAuth]);

  const loadDashboardData = async () => {
    if (authError || isCheckingAuth) return;
    
    setLoading(true);
    try {
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
      
      if (error.message.includes('Authentication') || error.message === 'Session expired') {
        await handleAuthFailure();
      } else if (!error.message.includes('Network error')) {
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

  // ==================== IMAGE PICKER HANDLERS ====================
  const handleSelectBlogImage = () => {
    Alert.alert(
      'Select Featured Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => launchCameraForBlog(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => launchImageLibraryForBlog(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const launchImageLibraryForBlog = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to select image. Please try again.');
      } else if (response.assets && response.assets[0]) {
        setBlogForm({...blogForm, featuredImageUri: response.assets[0].uri || null});
      }
    });
  };

  const launchCameraForBlog = () => {
    const options: ImagePicker.CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      } else if (response.assets && response.assets[0]) {
        setBlogForm({...blogForm, featuredImageUri: response.assets[0].uri || null});
      }
    });
  };

  const handleSelectVerdictImage = () => {
    Alert.alert(
      'Select Evidence Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => launchCameraForVerdict(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => launchImageLibraryForVerdict(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const launchImageLibraryForVerdict = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to select image. Please try again.');
      } else if (response.assets && response.assets[0]) {
        setVerdictForm({...verdictForm, imageUri: response.assets[0].uri || null});
      }
    });
  };

  const launchCameraForVerdict = () => {
    const options: ImagePicker.CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      } else if (response.assets && response.assets[0]) {
        setVerdictForm({...verdictForm, imageUri: response.assets[0].uri || null});
      }
    });
  };

  const uploadImage = async (imageUri: string): Promise<string> => {
    try {
      const imageUrl = await blogService.uploadBlogImage(imageUri);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  // ==================== CLAIM DATA LOADING ====================
  const extractUserInfo = (claim: any) => {
    let userEmail = 'Unknown Email';
    let userName = 'Unknown User';
    
    if (typeof claim.submittedBy === 'string' && claim.submittedBy.includes('@')) {
      userEmail = claim.submittedBy;
      userName = claim.submittedBy.split('@')[0];
    } else if (claim.user && typeof claim.user === 'object') {
      userEmail = claim.user.email || claim.user.user_email || 'Unknown Email';
      userName = claim.user.full_name || claim.user.name || claim.user.username || userEmail;
    } else if (claim.submitted_by && typeof claim.submitted_by === 'object') {
      userEmail = claim.submitted_by.email || claim.submitted_by.user_email || 'Unknown Email';
      userName = claim.submitted_by.full_name || claim.submitted_by.name || claim.submitted_by.username || userEmail;
    } else if (typeof claim.user_email === 'string' && claim.user_email.includes('@')) {
      userEmail = claim.user_email;
      userName = claim.user_name || claim.username || userEmail.split('@')[0];
    } else if (claim.user && typeof claim.user === 'string' && claim.user.includes('@')) {
      userEmail = claim.user;
      userName = claim.user.split('@')[0];
    } else if (typeof claim.submittedBy === 'string') {
      userName = claim.submittedBy;
    }
    
    return { userEmail, userName };
  };

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

  const loadPendingClaims = async () => {
    try {
      const data = await apiCall('/fact-checker/pending-claims');
      
      const claims = data.claims || data.data?.claims || data || [];
      
      const transformedClaims = claims.map((claim: any) => {
        const { userEmail, userName } = extractUserInfo(claim);
        
        const videoLink = claim.videoLink || claim.video_link || '';
        const sourceLink = claim.sourceLink || claim.source_link || '';
        
        let images: string[] = [];
        
        if (claim.mediaUrl && claim.mediaType === 'image') {
          images.push(claim.mediaUrl);
        }
        
        if (claim.userImages && Array.isArray(claim.userImages) && claim.userImages.length > 0) {
          images.push(...claim.userImages);
        }
        
        if (claim.imageUrl && !images.includes(claim.imageUrl)) {
          images.push(claim.imageUrl);
        }
        
        return {
          id: claim.id || claim.claim_id,
          title: claim.title || claim.claim_title || 'No Title',
          description: claim.description || claim.claim_description || claim.claimText || '',
          category: claim.category || 'general',
          submittedBy: userName,
          submittedByEmail: userEmail,
          submittedDate: claim.submittedDate || claim.created_at || claim.submitted_date || new Date().toISOString(),
          imageUrl: claim.imageUrl,
          images: images,
          mediaUrl: claim.mediaUrl,
          mediaType: claim.mediaType,
          videoLink: videoLink,
          sourceLink: sourceLink
        };
      });
      
      const uniqueClaims = transformedClaims.filter((claim: Claim, index: number, self: Claim[]) => 
        index === self.findIndex((c: Claim) => c.id === claim.id)
      );
      
      setPendingClaims(uniqueClaims);
      setExpandedPendingClaims(new Set());
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('Error loading pending claims:', error);
        setPendingClaims([]);
      }
      throw error;
    }
  };

  const loadAiSuggestions = async () => {
    try {
      const data = await apiCall('/fact-checker/ai-suggestions');
      
      const claims = data.claims || data.data?.claims || data || [];
      
      const transformedClaims = claims.map((claim: any) => {
        const { userEmail, userName } = extractUserInfo(claim);
        
        const videoLink = claim.videoLink || claim.video_link || '';
        const sourceLink = claim.sourceLink || claim.source_link || '';
        
        let images: string[] = [];
        
        if (claim.mediaUrl && claim.mediaType === 'image') {
          images.push(claim.mediaUrl);
        }
        
        if (claim.userImages && Array.isArray(claim.userImages) && claim.userImages.length > 0) {
          images.push(...claim.userImages);
        }
        
        if (claim.imageUrl && !images.includes(claim.imageUrl)) {
          images.push(claim.imageUrl);
        }
        
        return {
          id: claim.id || claim.claim_id,
          title: claim.title || claim.claim_title || 'No Title',
          description: claim.description || claim.claim_description || claim.claimText || '',
          category: claim.category || 'general',
          submittedBy: userName,
          submittedByEmail: userEmail,
          submittedDate: claim.submittedDate || claim.created_at || claim.submitted_date || new Date().toISOString(),
          imageUrl: claim.imageUrl,
          images: images,
          mediaUrl: claim.mediaUrl,
          mediaType: claim.mediaType,
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
      
      const uniqueClaims = transformedClaims.filter((claim: Claim, index: number, self: Claim[]) => 
        index === self.findIndex((c: Claim) => c.id === claim.id)
      );
      
      setAiSuggestions(uniqueClaims);
      setExpandedAiClaims(new Set());
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
      
      setStats({
        totalVerified: data.stats?.totalVerified || data.totalVerified || 0,
        pendingReview: data.stats?.pendingReview || data.pendingReview || 0,
        accuracy: data.stats?.accuracy || data.accuracy || '0%',
      });
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('Error loading stats:', error);
      }
      throw error;
    }
  };

  const loadBlogs = async () => {
    try {
      let data;
      
      try {
        data = await apiCall('/blogs');
      } catch (error) {
        try {
          data = await apiCall('/fact-checker/blogs');
        } catch (fallbackError) {
          throw new Error('Unable to load blogs at this time');
        }
      }
      
      const blogs = data.data || data.blogs || data || [];
      
      const publishedBlogs = blogs
        .filter((blog: any) => !blog.status || blog.status === 'published')
        .map((blog: any) => {
          let publishDate = blog.published_at || blog.created_at || blog.publish_date;
          
          if (!publishDate || isNaN(new Date(publishDate).getTime())) {
            publishDate = new Date().toISOString();
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
          };
        });
      
      setPublishedBlogs(publishedBlogs);
    } catch (error: any) {
      if (!error.message.includes('Authentication')) {
        console.error('Error loading blogs:', error);
        setPublishedBlogs([]);
      }
      throw error;
    }
  };

  // ==================== BLOG HANDLING ====================
  const handlePublishBlog = async () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      Alert.alert('Error', 'Please fill title and content fields');
      return;
    }

    setLoading(true);
    try {
      let featuredImageUrl = blogForm.featured_image;
      if (blogForm.featuredImageUri) {
        featuredImageUrl = await uploadImage(blogForm.featuredImageUri);
      }

      const currentDate = new Date().toISOString();
      
      const blogData = {
        title: blogForm.title.trim(),
        category: blogForm.category,
        content: blogForm.content.trim(),
        featured_image: featuredImageUrl || null,
        status: 'published',
        published_at: currentDate,
        created_at: currentDate
      };

      const response = await apiCall('/blogs', {
        method: 'POST',
        body: JSON.stringify(blogData),
      });

      const newBlog: Blog = {
        id: response.data?.id || response.blog?.id || `blog-${Date.now()}`,
        title: blogForm.title,
        category: blogForm.category,
        content: blogForm.content,
        publishedBy: response.data?.author_name || response.blog?.author_name || 'You',
        publishDate: response.data?.published_at || response.blog?.published_at || currentDate,
        featured_image: featuredImageUrl || undefined,
      };

      setPublishedBlogs(prev => [newBlog, ...prev]);
      Alert.alert('Success', 'Blog published successfully!');
      
      setBlogForm({title: '', category: 'Governance', content: '', featured_image: '', featuredImageUri: null});
      
    } catch (error: any) {
      console.error('Error publishing blog:', error);
      if (!error.message.includes('Authentication')) {
        Alert.alert('Error', error.message || 'Failed to publish blog. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== VERDICT HANDLING ====================
  const handleSubmitVerdict = async () => {
    if (!selectedClaim || !verdictForm.verdict.trim()) {
      Alert.alert('Error', 'Please provide a verdict explanation');
      return;
    }

    setLoading(true);
    try {
      let evidenceImageUrl = verdictForm.image_url;
      if (verdictForm.imageUri) {
        evidenceImageUrl = await uploadImage(verdictForm.imageUri);
      }

      const userImages: string[] = [];
      
      if (selectedClaim.mediaUrl && selectedClaim.mediaType === 'image') {
        userImages.push(selectedClaim.mediaUrl);
      }
      
      if (selectedClaim.images && selectedClaim.images.length > 0) {
        userImages.push(...selectedClaim.images);
      }
      
      if (selectedClaim.imageUrl && !userImages.includes(selectedClaim.imageUrl)) {
        userImages.push(selectedClaim.imageUrl);
      }

      const verdictData = {
        claimId: selectedClaim.id,
        verdict: verdictForm.status,
        explanation: verdictForm.verdict.trim(),
        sources: verdictForm.sources.split(',').map(s => s.trim()).filter(s => s),
        image_url: evidenceImageUrl || undefined,
        user_images: userImages,
        time_spent: 300
      };

      const response = await apiCall('/fact-checker/submit-verdict', {
        method: 'POST',
        body: JSON.stringify(verdictData),
      });

      Alert.alert('Success', 'Verdict submitted successfully and sent to user');
      
      setPendingClaims(prev => prev.filter(claim => claim.id !== selectedClaim.id));
      
      setSelectedClaim(null);
      setVerdictForm({status: 'verified', verdict: '', sources: '', image_url: '', imageUri: null});
      
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
      const claim = aiSuggestions.find(c => c.id === claimId);
      
      const userImages: string[] = [];
      
      if (claim) {
        if (claim.mediaUrl && claim.mediaType === 'image') {
          userImages.push(claim.mediaUrl);
        }
        
        if (claim.images && claim.images.length > 0) {
          userImages.push(...claim.images);
        }
        
        if (claim.imageUrl && !userImages.includes(claim.imageUrl)) {
          userImages.push(claim.imageUrl);
        }
      }

      const verdictData = {
        user_images: userImages
      };

      const response = await apiCall(`/fact-checker/approve-ai-verdict/${claimId}`, {
        method: 'POST',
        body: JSON.stringify(verdictData),
      });

      Alert.alert('Success', 'AI verdict approved and sent to user');
      
      setAiSuggestions(prev => prev.filter(claim => claim.id !== claimId));
      
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
      image_url: '',
      imageUri: null,
    });
  };

  // ==================== UI UTILITY FUNCTIONS ====================
  const getShortTopic = (text: string, wordCount: number = 7) => {
    if (!text) return 'No description available...';
    
    const words = text.trim().split(/\s+/);
    
    if (words.length <= wordCount) {
      return text + (text.endsWith('.') ? '' : '...');
    }
    
    const shortText = words.slice(0, wordCount).join(' ');
    return shortText + '...';
  };

  const renderClaimImages = (claim: Claim) => {
    const imagesToDisplay: string[] = [];
    
    if (claim.mediaUrl && claim.mediaType === 'image') {
      imagesToDisplay.push(claim.mediaUrl);
    }
    
    if (claim.images && claim.images.length > 0) {
      claim.images.forEach(img => {
        if (!imagesToDisplay.includes(img)) {
          imagesToDisplay.push(img);
        }
      });
    }
    
    if (claim.imageUrl && !imagesToDisplay.includes(claim.imageUrl)) {
      imagesToDisplay.push(claim.imageUrl);
    }
    
    if (imagesToDisplay.length === 0) {
      return null;
    }

    return (
      <View className="mb-3">
        <Text className="font-pmedium text-xs text-gray-600 mb-2">
          {imagesToDisplay.length > 1 ? 'Attached Images:' : 'Attached Image:'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row space-x-2">
            {imagesToDisplay.map((imageUrl, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => {
                  console.log('Image pressed:', imageUrl);
                }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  className="w-32 h-32 rounded-lg"
                  resizeMode="cover"
                  onError={(e) => {
                    console.log('Failed to load image:', imageUrl);
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // ==================== RENDER FUNCTIONS ====================
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
              <TouchableOpacity 
                onPress={() => togglePendingClaimExpansion(claim.id)}
                className="flex-row items-start">
                <View className="flex-1">
                  <Text className="text-gray-700 text-sm mb-2 leading-5">
                    {shortTopic}
                  </Text>
                  
                  <View className="flex-row flex-wrap items-center gap-2 mb-1">
                    <Text className="text-gray-500 text-[10px]">
                      Submitted: {formatDateOnly(claim.submittedDate)}
                    </Text>
                    <Text className="text-gray-500 text-[10px]">
                      By: {claim.submittedBy}
                    </Text>
                  </View>
                </View>
                
                <View className="ml-2 pt-1">
                  <Text className={`text-lg text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View className="border-t border-gray-200 pt-3 mt-3">
                  {claim.title && claim.description && claim.title !== claim.description && (
                    <View className="mb-4">
                      <Text className="font-psemibold text-base mb-2 text-gray-800">Full Claim:</Text>
                      <Text className="text-gray-700 text-sm leading-5">
                        {claim.description}
                      </Text>
                    </View>
                  )}
                  
                  {renderClaimImages(claim)}
                  
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

                  <View className="mb-3">
                    <Text className="font-pmedium text-xs text-gray-600 mb-1">Submitted by:</Text>
                    <Text className="text-xs text-gray-800">
                      {claim.submittedBy} {claim.submittedByEmail !== 'Unknown Email' ? `(${claim.submittedByEmail})` : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="py-2 rounded-lg mt-2"
                    style={{backgroundColor: '#0A864D'}}
                    onPress={() => {
                      setSelectedClaim(claim);
                      setVerdictForm({status: 'verified', verdict: '', sources: '', image_url: '', imageUri: null});
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
              <TouchableOpacity 
                onPress={() => toggleAiClaimExpansion(claim.id)}
                className="flex-row items-start">
                <View className="flex-1">
                  <Text className="text-gray-700 text-sm mb-2 leading-5">
                    {shortTopic}
                  </Text>
                  
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
                    <Text className="text-gray-500 text-[10px]">
                      Submitted: {formatDateOnly(claim.submittedDate)}
                    </Text>
                  </View>
                </View>
                
                <View className="ml-2 pt-1">
                  <Text className={`text-lg text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </Text>
                </View>
              </TouchableOpacity>

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

                  {renderClaimImages(claim)}

                  <View className="mb-3">
                    <Text className="font-pmedium text-xs text-gray-600 mb-2">User Provided Links:</Text>
                    
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
      </View>

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

        <Text className="font-pmedium mb-2 text-gray-800">Featured Image (Optional)</Text>
        <TouchableOpacity
          onPress={handleSelectBlogImage}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 items-center bg-gray-50">
          {blogForm.featuredImageUri ? (
            <>
              <Image 
                source={{uri: blogForm.featuredImageUri}} 
                className="w-full h-40 rounded-lg mb-2"
                resizeMode="cover"
              />
              <TouchableOpacity onPress={() => setBlogForm({...blogForm, featuredImageUri: null})}>
                <Text className="text-red-500 font-pmedium text-xs">Remove Image</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-gray-600 font-pmedium text-sm mb-1">Upload Featured Image</Text>
              <Text className="text-gray-400 font-pregular text-xs">Tap to add from camera or gallery</Text>
            </>
          )}
        </TouchableOpacity>

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
            
            {blog.featured_image && (
              <View className="w-full h-40 bg-gray-200">
                <Image 
                  source={{ uri: blog.featured_image }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            )}
            
            <View className="p-4">
              <View className="mb-3">
                <View className="flex-row items-start mb-2">
                  <View className="px-3 py-1 rounded-full" style={{backgroundColor: '#EF9334'}}>
                    <Text className="text-white text-[10px] font-pmedium">{blog.category}</Text>
                  </View>
                </View>
                <Text className="font-psemibold text-lg text-gray-800 mb-2">{blog.title}</Text>
              </View>
              
              <Text className="text-gray-600 text-sm mb-3" numberOfLines={3}>
                {blog.content}
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500 text-xs">
                  Published by: {blog.publishedBy}
                </Text>
                <Text className="text-gray-500 text-xs">
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

  // ==================== MAIN RENDER ====================
  if (isCheckingAuth) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className="text-lg font-pmedium text-gray-600 mt-4">
          Checking authentication...
        </Text>
      </View>
    );
  }

  if (authError) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
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

      {/* Claim Details Modal */}
      <Modal
        visible={selectedClaim !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedClaim(null)}>
        <View className="flex-1 bg-white">
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
                      Submitted: {formatDateOnly(selectedClaim.submittedDate)}
                    </Text>
                  </View>

                  <Text className="font-psemibold text-base mb-2 text-gray-800">
                    {selectedClaim.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-4">
                    {selectedClaim.description}
                  </Text>

                  {renderClaimImages(selectedClaim)}

                  <View className="mb-4">
                    <Text className="font-pmedium text-xs text-gray-600 mb-1">Submitted by:</Text>
                    <Text className="text-xs text-gray-800">
                      {selectedClaim.submittedBy} {selectedClaim.submittedByEmail !== 'Unknown Email' ? `(${selectedClaim.submittedByEmail})` : ''}
                    </Text>
                  </View>

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
                </View>

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
                </View>

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

      {/* Blog Details Modal */}
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