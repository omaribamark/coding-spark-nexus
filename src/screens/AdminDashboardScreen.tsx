import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState, useEffect, useRef} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
  Linking,
} from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import {icons} from '../constants';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeItem } from '../utils/AsyncStorage';
import { RichTextRenderer } from '../components';

type Props = {};

type User = {
  id: string;
  username: string;
  email: string;
  phone: string;
  country?: string;
  role: 'user' | 'fact_checker' | 'admin';
  status: 'active' | 'suspended' | 'inactive';
  registration_status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  last_login: string;
  created_at: string;
  total_points: number;
  profile_picture?: string;
};

type FactChecker = {
  id: string;
  user_id: string;
  email: string;
  username: string;
  phone: string;
  credentials: string;
  areas_of_expertise: string[];
  verification_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  joined_date: string;
  last_login: string;
  user_status: string;
  verdicts_count: number;
  last_activity: string;
  avg_time_spent: number;
  total_verdicts: number;
  avg_review_time: number;
  active_days: number;
  last_review: string;
};

type DashboardStats = {
  total_users: number;
  total_claims: number;
  pending_claims: number;
  human_pending_claims: number;
  verified_false_claims: number;
  active_fact_checkers: number;
  pending_registrations: number;
  total_blogs: number;
  total_admins: number;
};

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
  status: 'pending' | 'in_review' | 'completed';
  verdict?: string;
  verdict_description?: string;
  fact_checker?: string;
  verdict_date?: string;
  aiSuggestion?: {
    status: 'verified' | 'false' | 'misleading' | 'needs_context';
    verdict: string;
    confidence: number;
    sources: string[];
    analyzedAt?: string;
  };
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Custom Input Component with Password Toggle
const StableTextInput = React.forwardRef<TextInput, {
  title: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  editable?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
}>(({
  title,
  value,
  placeholder,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  returnKeyType = 'next',
  onSubmitEditing,
  blurOnSubmit = false,
  editable = true,
  showPasswordToggle = false,
  onTogglePassword,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-pmedium text-gray-800 mb-1">{title}</Text>
      <View 
        className={`border-b-2 ${isFocused ? 'border-[#0A864D]' : 'border-gray-300'} ${error ? 'border-red-500' : ''} ${!editable ? 'bg-gray-100' : ''} flex-row items-center`}
        style={{ paddingVertical: 0 }}>
        <TextInput
          ref={ref}
          className="text-gray-800 text-base font-pregular flex-1"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
          autoCorrect={false}
          editable={editable}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 0,
            margin: 0,
            height: 40,
            textAlignVertical: 'center',
          }}
        />
        {showPasswordToggle && (
          <TouchableOpacity onPress={onTogglePassword} className="ml-2">
            <Image 
              source={secureTextEntry ? icons.eyeHide : icons.eye} 
              style={{ width: 20, height: 20, tintColor: '#6B7280' }}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs font-pregular mt-1">{error}</Text>}
    </View>
  );
});

const AdminDashboardScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'factcheckers' | 'register' | 'system'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_claims: 0,
    pending_claims: 0,
    human_pending_claims: 0,
    verified_false_claims: 0,
    active_fact_checkers: 0,
    pending_registrations: 0,
    total_blogs: 0,
    total_admins: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [factCheckers, setFactCheckers] = useState<FactChecker[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Current admin state to check permissions
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  
  // Registration form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhoneNumber, setRegisterPhoneNumber] = useState('');
  const [registerExpertise, setRegisterExpertise] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('KE');
  const [country, setCountry] = useState<Country | null>(null);
  const [callingCode, setCallingCode] = useState('254');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [registerRole, setRegisterRole] = useState<'fact_checker' | 'admin'>('fact_checker');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form validation errors
  const [emailError, setEmailError] = useState('');

  const onSelectCountry = (selectedCountry: Country) => {
    setCountry(selectedCountry);
    setCountryCode(selectedCountry.cca2);
    setCallingCode(String(selectedCountry.callingCode[0]));
    setShowCountryPicker(false);
  };
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFactChecker, setSelectedFactChecker] = useState<FactChecker | null>(null);
  const [factCheckerClaims, setFactCheckerClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  
  // Reset password form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Modals
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showFactCheckerDetails, setShowFactCheckerDetails] = useState(false);
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [showClaimDetails, setShowClaimDetails] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Refs for text inputs
  const emailInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Focus management functions
  const focusUsername = () => {
    usernameInputRef.current?.focus();
  };

  const focusPassword = () => {
    passwordInputRef.current?.focus();
  };

  const focusConfirmPassword = () => {
    confirmPasswordInputRef.current?.focus();
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
  };

  // Handle email input with validation
  const handleEmailChange = (text: string) => {
    setRegisterEmail(text);
    if (text && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadCurrentAdmin();
  }, []);

  // Load current admin data for permissions
  const loadCurrentAdmin = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentAdmin(user);
      }
    } catch (error) {
      console.error('Error loading current admin:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboardData().finally(() => setRefreshing(false));
  }, []);

  // API Service functions
  const apiService = {
    async getDashboardStats(): Promise<DashboardStats> {
      try {
        const response = await api.get('/admin/dashboard/stats');
        console.log('Dashboard stats response:', response.data);
        return response.data.stats;
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Unable to load dashboard statistics. Please check your connection and try again.';
        Alert.alert('Dashboard Error', errorMsg);
        throw error;
      }
    },

    async getUsers(): Promise<User[]> {
      try {
        const response = await api.get('/admin/users');
        console.log('Users response:', response.data);
        return response.data.users || [];
      } catch (error: any) {
        console.error('Error fetching users:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Unable to load users. Please try again later.';
        Alert.alert('Load Error', errorMsg);
        return [];
      }
    },

    async getFactCheckers(): Promise<FactChecker[]> {
      try {
        const response = await api.get('/admin/fact-checkers');
        console.log('Fact checkers response:', response.data);
        return response.data.fact_checkers || [];
      } catch (error: any) {
        console.error('Error fetching fact checkers:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Unable to load fact checkers. Please try again later.';
        Alert.alert('Load Error', errorMsg);
        return [];
      }
    },

    async getAdmins(): Promise<User[]> {
      try {
        const response = await api.get('/admin/admins');
        console.log('Admins response:', response.data);
        return response.data.admins || [];
      } catch (error: any) {
        console.error('Error fetching admins:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Unable to load administrators. Please try again later.';
        Alert.alert('Load Error', errorMsg);
        return [];
      }
    },

    async getPendingClaims(): Promise<Claim[]> {
      try {
        const response = await api.get('/admin/pending-claims');
        console.log('Pending claims response:', response.data);
        return response.data.claims || response.data.data?.claims || [];
      } catch (error: any) {
        console.error('Error fetching pending claims:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Unable to load pending claims. Please try again later.';
        Alert.alert('Load Error', errorMsg);
        return [];
      }
    },

    async getUserDetails(userId: string): Promise<User> {
      try {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data.user;
      } catch (error: any) {
        console.error('Error fetching user details:', error);
        throw error;
      }
    },

    async getFactCheckerDetails(userId: string): Promise<FactChecker> {
      try {
        const response = await api.get(`/admin/fact-checkers/${userId}`);
        return response.data.fact_checker;
      } catch (error: any) {
        console.error('Error fetching fact checker details:', error);
        throw error;
      }
    },

    async getFactCheckerClaims(userId: string): Promise<any[]> {
      try {
        const response = await api.get(`/admin/fact-checkers/${userId}/claims`);
        return response.data.claims || response.data.data || [];
      } catch (error: any) {
        console.error('Error fetching fact checker claims:', error);
        return [];
      }
    },

    async getClaimDetails(claimId: string): Promise<any> {
      try {
        const response = await api.get(`/claims/${claimId}`);
        return response.data.claim || response.data;
      } catch (error: any) {
        console.error('Error fetching claim details:', error);
        throw error;
      }
    },

    async registerUser(userData: {
      email: string;
      username: string;
      password: string;
      phone?: string;
      areasOfExpertise?: string[];
      role: 'fact_checker' | 'admin';
    }): Promise<boolean> {
      try {
        let endpoint = '';
        let requestBody: any = {
          email: userData.email,
          username: userData.username,
          password: userData.password,
        };

        if (userData.role === 'fact_checker') {
          endpoint = '/admin/users/register-fact-checker';
          requestBody.areasOfExpertise = userData.areasOfExpertise || [];
          if (userData.phone) {
            requestBody.phone = userData.phone;
          }
        } else if (userData.role === 'admin') {
          endpoint = '/admin/users/register-admin';
          if (userData.phone) {
            requestBody.phone = userData.phone;
          }
        } else {
          throw new Error('Invalid role specified');
        }

        console.log(`Registering ${userData.role} with endpoint:`, endpoint, requestBody);

        const response = await api.post(endpoint, requestBody);
        return response.data.success;
      } catch (error: any) {
        console.error('Error registering user:', error);
        throw error;
      }
    },

    async updateUserStatus(userId: string, action: 'suspend' | 'activate' | 'approve', reason?: string): Promise<boolean> {
      try {
        const response = await api.post(`/admin/users/${userId}/actions`, {
          action,
          reason
        });
        return response.data.success;
      } catch (error: any) {
        console.error('Error updating user status:', error);
        throw error;
      }
    },

    async resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
      try {
        const response = await api.post(`/admin/users/${userId}/reset-password`, {
          newPassword
        });
        return response.data.success;
      } catch (error: any) {
        console.error('Error resetting user password:', error);
        throw error;
      }
    },

    async resetFactCheckerPassword(userId: string, newPassword: string): Promise<boolean> {
      try {
        const response = await api.post(`/admin/fact-checkers/${userId}/reset-password`, {
          newPassword
        });
        return response.data.success;
      } catch (error: any) {
        console.error('Error resetting fact checker password:', error);
        throw error;
      }
    },

    async resetAdminPassword(userId: string, newPassword: string): Promise<boolean> {
      try {
        const response = await api.post(`/admin/admins/${userId}/reset-password`, {
          newPassword
        });
        return response.data.success;
      } catch (error: any) {
        console.error('Error resetting admin password:', error);
        throw error;
      }
    },

    async deleteUser(userId: string): Promise<boolean> {
      try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data.success;
      } catch (error: any) {
        console.error('Error deleting user:', error);
        throw error;
      }
    },

    async deleteFactChecker(userId: string): Promise<boolean> {
      try {
        const response = await api.delete(`/admin/fact-checkers/${userId}`);
        return response.data.success;
      } catch (error: any) {
        console.error('Error deleting fact checker:', error);
        throw error;
      }
    },

    async deleteAdmin(userId: string): Promise<boolean> {
      try {
        const response = await api.delete(`/admin/admins/${userId}`);
        return response.data.success;
      } catch (error: any) {
        console.error('Error deleting admin:', error);
        throw error;
      }
    },
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, factCheckersData, adminsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getUsers(),
        apiService.getFactCheckers(),
        apiService.getAdmins(),
      ]);

      // Fetch fact-checker stats to get accurate pending claims count
      let factCheckerStats = null;
      try {
        const response = await api.get('/fact-checker/stats');
        factCheckerStats = response.data.stats || response.data;
      } catch (error) {
        console.log('Could not fetch fact-checker stats:', error);
      }

      // Use fact-checker pending count if available, otherwise use admin stats
      const updatedStats = {
        ...statsData,
        human_pending_claims: factCheckerStats?.pendingReview || statsData.pending_claims || 0
      };

      setStats(updatedStats);
      setUsers(usersData);
      setFactCheckers(factCheckersData);
      setAdmins(adminsData);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingClaims = async () => {
    setLoading(true);
    try {
      const pendingClaimsData = await apiService.getPendingClaims();
      setPendingClaims(pendingClaimsData);
    } catch (error: any) {
      console.error('Error loading pending claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async () => {
    // Clear previous errors
    setEmailError('');

    // Validation
    if (!registerEmail || !registerUsername || !registerPassword) {
      Alert.alert('Error', 'Please fill all required fields (email, username, password)');
      return;
    }

    // Email validation using regex
    if (!validateEmail(registerEmail)) {
      setEmailError('Please enter a valid email address');
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (registerPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const userData: any = {
        email: registerEmail,
        username: registerUsername,
        password: registerPassword,
        role: registerRole,
      };

      // Add phone if provided
      if (registerPhoneNumber) {
        userData.phone = `+${callingCode}${registerPhoneNumber}`;
      }

      // Add fact checker specific fields
      if (registerRole === 'fact_checker') {
        userData.areasOfExpertise = registerExpertise ? [registerExpertise] : [];
      }

      const success = await apiService.registerUser(userData);
      
      if (success) {
        Alert.alert('Success', `${registerRole === 'fact_checker' ? 'Fact Checker' : 'Admin'} registered successfully`);
        // Reset form
        setRegisterEmail('');
        setRegisterUsername('');
        setRegisterPassword('');
        setRegisterPhoneNumber('');
        setRegisterExpertise('');
        setCountry(null);
        setCountryCode('KE');
        setCallingCode('254');
        setRegisterRole('fact_checker');
        setShowPassword(false);
        setEmailError('');
        // Refresh data
        loadDashboardData();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.response?.data?.error || 'Failed to register user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'approve' | 'reset_password' | 'delete' | 'view_details') => {
    if (action === 'reset_password') {
      const user = users.find(u => u.id === userId);
      if (user) {
        setResetEmail(user.email);
        setResetNewPassword('');
        setResetConfirmPassword('');
        setShowResetPassword(true);
        setSelectedUser(user);
        setSelectedFactChecker(null);
        setSelectedAdmin(null);
      }
      return;
    }

    if (action === 'view_details') {
      try {
        setActionLoading(`details_${userId}`);
        const userDetails = await apiService.getUserDetails(userId);
        setSelectedUser(userDetails);
        setShowUserDetails(true);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.error || 'Failed to load user details');
      } finally {
        setActionLoading(null);
      }
      return;
    }

    setActionLoading(`${action}_${userId}`);
    try {
      let success = false;
      
      if (action === 'suspend' || action === 'activate' || action === 'approve') {
        success = await apiService.updateUserStatus(userId, action);
      } else if (action === 'delete') {
        success = await apiService.deleteUser(userId);
      }

      if (success) {
        Alert.alert('Success', `User ${action}${action === 'delete' ? 'd' : 'ed'} successfully`);
        loadDashboardData();
      } else {
        Alert.alert('Error', `Failed to ${action} user`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || `Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFactCheckerAction = async (userId: string, action: 'suspend' | 'activate' | 'reset_password' | 'delete' | 'view_details') => {
    if (action === 'reset_password') {
      const user = users.find(u => u.id === userId && u.role === 'fact_checker');
      if (user) {
        setResetEmail(user.email);
        setResetNewPassword('');
        setResetConfirmPassword('');
        setShowResetPassword(true);
        setSelectedUser(user);
        setSelectedFactChecker(null);
        setSelectedAdmin(null);
      }
      return;
    }

    if (action === 'view_details') {
      try {
        setActionLoading(`details_${userId}`);
        const userDetails = await apiService.getUserDetails(userId);
        setSelectedUser(userDetails);
        setShowUserDetails(true);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.error || 'Failed to load fact checker details');
      } finally {
        setActionLoading(null);
      }
      return;
    }

    setActionLoading(`${action}_${userId}`);
    try {
      let success = false;
      
      if (action === 'suspend' || action === 'activate') {
        success = await apiService.updateUserStatus(userId, action);
      } else if (action === 'delete') {
        success = await apiService.deleteUser(userId);
      }

      if (success) {
        Alert.alert('Success', `Fact Checker ${action}${action === 'delete' ? 'd' : 'ed'} successfully`);
        loadDashboardData();
      } else {
        Alert.alert('Error', `Failed to ${action} fact checker`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || `Failed to ${action} fact checker`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdminAction = async (userId: string, action: 'reset_password' | 'view_details' | 'delete') => {
    if (action === 'reset_password') {
      const admin = admins.find(a => a.id === userId);
      if (admin) {
        setResetEmail(admin.email);
        setResetNewPassword('');
        setResetConfirmPassword('');
        setShowResetPassword(true);
        setSelectedAdmin(admin);
        setSelectedUser(null);
        setSelectedFactChecker(null);
      }
      return;
    }

    if (action === 'view_details') {
      try {
        setActionLoading(`details_${userId}`);
        const adminDetails = await apiService.getUserDetails(userId);
        setSelectedAdmin(adminDetails);
        setShowAdminDetails(true);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.error || 'Failed to load admin details');
      } finally {
        setActionLoading(null);
      }
      return;
    }

    if (action === 'delete') {
      // Check if current admin is trying to delete themselves
      if (currentAdmin && currentAdmin.id === userId) {
        Alert.alert('Error', 'You cannot delete your own account');
        return;
      }

      Alert.alert(
        'Delete Admin',
        'Are you sure you want to delete this admin? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setActionLoading(`delete_${userId}`);
              try {
                const success = await apiService.deleteAdmin(userId);
                if (success) {
                  Alert.alert('Success', 'Admin deleted successfully');
                  loadDashboardData();
                } else {
                  Alert.alert('Error', 'Failed to delete admin');
                }
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.error || 'Failed to delete admin');
              } finally {
                setActionLoading(null);
              }
            }
          }
        ]
      );
      return;
    }
  };

  const handleResetPassword = async () => {
    if (!resetNewPassword || !resetConfirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (resetNewPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      if (selectedUser) {
        if (selectedUser.role === 'fact_checker') {
          success = await apiService.resetFactCheckerPassword(selectedUser.id, resetNewPassword);
        } else {
          success = await apiService.resetUserPassword(selectedUser.id, resetNewPassword);
        }
      } else if (selectedAdmin) {
        success = await apiService.resetAdminPassword(selectedAdmin.id, resetNewPassword);
      }

      if (success) {
        Alert.alert('Success', 'Password reset successfully');
        setShowResetPassword(false);
        setResetEmail('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setSelectedUser(null);
        setSelectedFactChecker(null);
        setSelectedAdmin(null);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        Alert.alert('Error', 'Failed to reset password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClaim = async (claimId: string) => {
    try {
      setLoadingClaims(true);
      const claimDetails = await apiService.getClaimDetails(claimId);
      setSelectedClaim(claimDetails);
      setShowClaimDetails(true);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load claim details');
    } finally {
      setLoadingClaims(false);
    }
  };

  const handleSystemAction = async (action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'backup':
          Alert.alert('Success', 'System backup initiated');
          break;
        case 'clear_cache':
          Alert.alert('Success', 'Cache cleared successfully');
          break;
        case 'update_system':
          Alert.alert('Success', 'System update initiated');
          break;
        case 'generate_reports':
          Alert.alert('Success', 'Reports generated successfully');
          break;
        default:
          break;
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || `Failed to ${action.replace('_', ' ')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all authentication data
              await removeItem('userToken');
              await removeItem('userData');
              await removeItem('userEmail');
              await removeItem('userName');
              await AsyncStorage.clear(); // Clear all AsyncStorage
              
              // Force navigation reset to Login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              // Force navigate even if error
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTimeFull = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Check if current admin can delete other admins (super admin)
  const canDeleteAdmin = (adminId: string) => {
    // Super admin can delete other admins but not themselves
    return currentAdmin && currentAdmin.id !== adminId;
  };

  // Get short topic for claims
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

  // Render Functions
  const renderOverview = () => (
    <View className="pb-6">
      <Text className="text-xl font-pbold mb-4 text-gray-800">
        Dashboard Overview
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0A864D" />
      ) : (
        <View className="flex-row flex-wrap">
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Total Users</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.total_users}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Total Claims</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.total_claims}
              </Text>
            </View>
          </View>

          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Human Pending Claims</Text>
              <Text className="text-2xl font-pbold text-gray-800">{stats.human_pending_claims || 0}</Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Fact Checkers</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.active_fact_checkers}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Total Blogs</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.total_blogs}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Admins</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.total_admins}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderUsers = () => {
    const regularUsers = users
      .filter(u => u.role === 'user')
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0));

    return (
      <View className="pb-6">
        <Text className="text-xl font-pbold mb-4 text-gray-800">
          Manage Users ({regularUsers.length})
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0A864D" />
        ) : regularUsers.length === 0 ? (
          <Text className="text-gray-500 text-center py-4">No users found</Text>
        ) : (
          regularUsers.map(user => (
            <View key={user.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <Text className="font-psemibold text-sm text-gray-800">{user.username}</Text>
                  <Text className="text-gray-600 text-xs">{user.email}</Text>
                  <Text className="text-gray-500 text-xs">Phone: {user.phone || 'Not provided'}</Text>
                  {user.country && <Text className="text-gray-500 text-xs">Country: {user.country}</Text>}
                  <Text className="text-gray-500 text-xs">Joined: {formatDate(user.created_at)}</Text>
                  <Text className="text-gray-500 text-xs">Last Online: {formatDateTime(user.last_login)}</Text>
                  <Text className="text-gray-500 text-xs">Status: {user.status} | {user.registration_status}</Text>
                  <Text className="text-green-600 text-xs font-pmedium">Points: {user.total_points || 0}</Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-2xl mr-1">🏆</Text>
                    <Text className="font-pbold text-lg text-gray-800">{user.total_points || 0}</Text>
                  </View>
                  <Text className="text-gray-500 text-xs">Points</Text>
                </View>
              </View>
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  className="flex-1 bg-blue-100 py-2 rounded-lg border border-blue-200"
                  onPress={() => handleUserAction(user.id, 'view_details')}
                  disabled={actionLoading === `details_${user.id}`}>
                  <Text className="text-blue-700 font-pmedium text-center text-xs">
                    {actionLoading === `details_${user.id}` ? '...' : 'Details'}
                  </Text>
                </TouchableOpacity>
                {user.status === 'active' ? (
                  <TouchableOpacity
                    className="flex-1 bg-red-100 py-2 rounded-lg border border-red-200"
                    onPress={() => handleUserAction(user.id, 'suspend')}
                    disabled={actionLoading === `suspend_${user.id}`}>
                    <Text className="text-red-700 font-pmedium text-center text-xs">
                      {actionLoading === `suspend_${user.id}` ? '...' : 'Suspend'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="flex-1 bg-green-100 py-2 rounded-lg border border-green-200"
                    onPress={() => handleUserAction(user.id, 'activate')}
                    disabled={actionLoading === `activate_${user.id}`}>
                    <Text className="text-green-700 font-pmedium text-center text-xs">
                      {actionLoading === `activate_${user.id}` ? '...' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                )}
                {user.registration_status === 'pending' && (
                  <TouchableOpacity
                    className="flex-1 bg-green-100 py-2 rounded-lg border border-green-200"
                    onPress={() => handleUserAction(user.id, 'approve')}
                    disabled={actionLoading === `approve_${user.id}`}>
                    <Text className="text-green-700 font-pmedium text-center text-xs">
                      {actionLoading === `approve_${user.id}` ? '...' : 'Approve'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="flex-1 bg-blue-100 py-2 rounded-lg border border-blue-200"
                  onPress={() => handleUserAction(user.id, 'reset_password')}>
                  <Text className="text-blue-700 font-pmedium text-center text-xs">Reset PW</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-2 rounded-lg border border-gray-300"
                  onPress={() => handleUserAction(user.id, 'delete')}
                  disabled={actionLoading === `delete_${user.id}`}>
                  <Text className="text-gray-700 font-pmedium text-center text-xs">
                    {actionLoading === `delete_${user.id}` ? '...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderFactCheckers = () => {
    // Use the users array to get fact checkers since that's where the status field is
    const factCheckerUsers = users.filter(u => u.role === 'fact_checker');

    return (
      <View className="pb-6">
        <Text className="text-xl font-pbold mb-4 text-gray-800">
          Fact Checker Management ({factCheckerUsers.length})
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0A864D" />
        ) : factCheckerUsers.length === 0 ? (
          <Text className="text-gray-500 text-center py-4">No fact checkers found</Text>
        ) : (
          factCheckerUsers.map(user => (
            <View key={user.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <Text className="font-psemibold text-sm text-gray-800">{user.username}</Text>
                  <Text className="text-gray-600 text-xs">{user.email}</Text>
                  <Text className="text-gray-500 text-xs">Phone: {user.phone || 'Not provided'}</Text>
                  {user.country && <Text className="text-gray-500 text-xs">Country: {user.country}</Text>}
                  <Text className="text-gray-500 text-xs">Joined: {formatDate(user.created_at)}</Text>
                  <Text className="text-gray-500 text-xs">Last Online: {formatDateTime(user.last_login)}</Text>
                  <Text className="text-gray-500 text-xs">Status: {user.status} | {user.registration_status}</Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-2xl mr-1">📊</Text>
                    <Text className="font-pbold text-lg text-gray-800">
                      {factCheckers.find(fc => fc.user_id === user.id)?.verdicts_count || 0}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-xs">Claims</Text>
                  <TouchableOpacity 
                    onPress={async () => {
                      setLoadingClaims(true);
                      try {
                        const claims = await apiService.getFactCheckerClaims(user.id);
                        setFactCheckerClaims(claims);
                        setSelectedFactChecker({ ...user, verdicts_count: claims.length } as any);
                        setShowFactCheckerDetails(true);
                      } catch (error: any) {
                        Alert.alert('Error', 'Failed to load claims');
                      } finally {
                        setLoadingClaims(false);
                      }
                    }}
                    className="bg-[#0A864D] px-3 py-1 rounded-md mt-1">
                    <Text className="text-white text-xs font-pmedium">View Claims</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  className="flex-1 bg-blue-100 py-2 rounded-lg border border-blue-200"
                  onPress={() => handleFactCheckerAction(user.id, 'view_details')}
                  disabled={actionLoading === `details_${user.id}`}>
                  <Text className="text-blue-700 font-pmedium text-center text-xs">
                    {actionLoading === `details_${user.id}` ? '...' : 'Details'}
                  </Text>
                </TouchableOpacity>
                {user.status === 'active' ? (
                  <TouchableOpacity
                    className="flex-1 bg-red-100 py-2 rounded-lg border border-red-200"
                    onPress={() => handleFactCheckerAction(user.id, 'suspend')}
                    disabled={actionLoading === `suspend_${user.id}`}>
                    <Text className="text-red-700 font-pmedium text-center text-xs">
                      {actionLoading === `suspend_${user.id}` ? '...' : 'Suspend'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="flex-1 bg-green-100 py-2 rounded-lg border border-green-200"
                    onPress={() => handleFactCheckerAction(user.id, 'activate')}
                    disabled={actionLoading === `activate_${user.id}`}>
                    <Text className="text-green-700 font-pmedium text-center text-xs">
                      {actionLoading === `activate_${user.id}` ? '...' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="flex-1 bg-blue-100 py-2 rounded-lg border border-blue-200"
                  onPress={() => handleFactCheckerAction(user.id, 'reset_password')}>
                  <Text className="text-blue-700 font-pmedium text-center text-xs">Reset PW</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-2 rounded-lg border border-gray-300"
                  onPress={() => handleFactCheckerAction(user.id, 'delete')}
                  disabled={actionLoading === `delete_${user.id}`}>
                  <Text className="text-gray-700 font-pmedium text-center text-xs">
                    {actionLoading === `delete_${user.id}` ? '...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderRegister = () => (
    <View className="pb-6">
      {/* Centered Header */}
      <View className="items-center mb-6">
        <Text className="text-2xl font-pbold text-gray-800 text-center">
          Register New User
        </Text>
        <Text className="text-gray-600 text-sm text-center mt-2">
          Create new fact checker or admin accounts
        </Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <StableTextInput
          ref={emailInputRef}
          title="Email *"
          value={registerEmail}
          placeholder="email@example.com"
          onChangeText={handleEmailChange}
          error={emailError}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={focusUsername}
        />

        <StableTextInput
          ref={usernameInputRef}
          title="Username *"
          value={registerUsername}
          placeholder="username"
          onChangeText={setRegisterUsername}
          returnKeyType="next"
          onSubmitEditing={focusPassword}
        />

        <View className="mb-4">
          <Text className="text-sm font-pmedium text-gray-800 mb-1">Country</Text>
          <TouchableOpacity 
            onPress={() => setShowCountryPicker(true)}
            className="border-b-2 border-gray-300 py-2">
            <View className="flex-row items-center">
              <CountryPicker
                countryCode={countryCode}
                withFilter
                withFlag
                withCountryNameButton={false}
                withAlphaFilter
                withCallingCode
                onSelect={onSelectCountry}
                visible={showCountryPicker}
                onClose={() => setShowCountryPicker(false)}
              />
              <Text className="text-gray-800 font-pregular ml-2">
                {country ? (typeof country.name === 'string' ? country.name : country.name.common || 'Select Country') : 'Select Country'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-pmedium text-gray-800 mb-1">Phone Number</Text>
          <View className="flex-row items-center">
            <View className="border-b-2 border-gray-300 mr-2">
              <Text className="text-gray-800 font-pmedium py-2 px-2">+{callingCode}</Text>
            </View>
            <View className="flex-1">
              <StableTextInput
                title=""
                value={registerPhoneNumber}
                placeholder="700 000 000"
                onChangeText={(text) => setRegisterPhoneNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>
          </View>
        </View>

        <StableTextInput
          ref={passwordInputRef}
          title="Password *"
          value={registerPassword}
          placeholder="Password (min 6 characters)"
          onChangeText={setRegisterPassword}
          secureTextEntry={!showPassword}
          returnKeyType="done"
          blurOnSubmit={true}
          showPasswordToggle={true}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        {/* Centered Role Selection */}
        <View className="items-center mb-6">
          <Text className="font-pmedium mb-3 text-sm text-gray-800 text-center">
            Select Role *
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="px-6 py-3 rounded-lg border"
              style={{
                backgroundColor: registerRole === 'fact_checker' ? '#0A864D' : '#f8f9fa',
                borderColor: registerRole === 'fact_checker' ? '#0A864D' : '#d1d5db',
              }}
              onPress={() => setRegisterRole('fact_checker')}>
              <Text
                className="text-center font-pmedium text-sm"
                style={{color: registerRole === 'fact_checker' ? 'white' : '#374151'}}>
                Fact Checker
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-6 py-3 rounded-lg border"
              style={{
                backgroundColor: registerRole === 'admin' ? '#EF9334' : '#f8f9fa',
                borderColor: registerRole === 'admin' ? '#EF9334' : '#d1d5db',
              }}
              onPress={() => setRegisterRole('admin')}>
              <Text
                className="text-center font-pmedium text-sm"
                style={{color: registerRole === 'admin' ? 'white' : '#374151'}}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Centered Register Button */}
        <View className="items-center">
          <TouchableOpacity
            className="py-4 rounded-lg border border-green-600 w-full max-w-xs"
            style={{backgroundColor: '#0A864D'}}
            onPress={handleRegisterUser}
            disabled={loading || !!emailError}>
            <Text className="text-white text-center font-pbold text-base">
              {loading ? 'Registering...' : 'Register User'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSystem = () => (
    <View className="pb-6">
      <Text className="text-xl font-pbold mb-4 text-gray-800">
        System Administration
      </Text>

      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
        <Text className="font-psemibold text-lg mb-3 text-gray-800">
          Admin Management ({admins.length})
        </Text>
        
        {admins.length === 0 ? (
          <Text className="text-gray-500 text-center py-4">No admins found</Text>
        ) : (
          admins.map(admin => (
            <View key={admin.id} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-300">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-pmedium text-sm text-gray-800">{admin.username}</Text>
                  <Text className="text-gray-600 text-xs">{admin.email}</Text>
                  <Text className="text-gray-500 text-xs">Phone: {admin.phone || 'Not provided'}</Text>
                  <Text className="text-gray-500 text-xs">Joined: {formatDate(admin.created_at)}</Text>
                  <Text className="text-gray-500 text-xs">Last Online: {formatDateTime(admin.last_login)}</Text>
                  <Text className="text-gray-500 text-xs">Status: {admin.status}</Text>
                  {currentAdmin && admin.id === currentAdmin.id && (
                    <Text className="text-blue-500 text-xs font-pmedium">(Current User)</Text>
                  )}
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="bg-blue-100 px-3 py-1 rounded-lg border border-blue-200"
                    onPress={() => handleAdminAction(admin.id, 'view_details')}>
                    <Text className="text-blue-700 font-pmedium text-xs">Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-green-100 px-3 py-1 rounded-lg border border-green-200"
                    onPress={() => handleAdminAction(admin.id, 'reset_password')}>
                    <Text className="text-green-700 font-pmedium text-xs">Reset PW</Text>
                  </TouchableOpacity>
                  {canDeleteAdmin(admin.id) && (
                    <TouchableOpacity
                      className="bg-red-100 px-3 py-1 rounded-lg border border-red-200"
                      onPress={() => handleAdminAction(admin.id, 'delete')}
                      disabled={actionLoading === `delete_${admin.id}`}>
                      <Text className="text-red-700 font-pmedium text-xs">
                        {actionLoading === `delete_${admin.id}` ? '...' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'factcheckers':
        return renderFactCheckers();
      case 'register':
        return renderRegister();
      case 'system':
        return renderSystem();
      default:
        return renderOverview();
    }
  };

  // Detail Modals
  const renderUserDetailsModal = () => (
    <Modal
      visible={showUserDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowUserDetails(false)}>
      <View className="flex-1 justify-center bg-black/50 p-6">
        <View className="bg-white rounded-2xl p-6 max-h-[80%]">
          <ScrollView>
            <Text className="text-xl font-pbold mb-4 text-gray-800 text-center">
              User Details
            </Text>
            
            {selectedUser && (
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Username:</Text>
                  <Text className="font-pregular text-gray-800">{selectedUser.username}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Email:</Text>
                  <Text className="font-pregular text-gray-800">{selectedUser.email}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Phone:</Text>
                  <Text className="font-pregular text-gray-800">{selectedUser.phone || 'Not provided'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Role:</Text>
                  <Text className="font-pregular text-gray-800 capitalize">{selectedUser.role}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Status:</Text>
                  <Text className="font-pregular text-gray-800 capitalize">{selectedUser.status}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Registration:</Text>
                  <Text className="font-pregular text-gray-800 capitalize">{selectedUser.registration_status}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Verified:</Text>
                  <Text className="font-pregular text-gray-800">{selectedUser.is_verified ? 'Yes' : 'No'}</Text>
                </View>
                {selectedUser.role === 'user' && (
                  <View className="flex-row justify-between">
                    <Text className="font-pmedium text-gray-600">Total Points:</Text>
                    <Text className="font-pregular text-gray-800">{selectedUser.total_points || 0}</Text>
                  </View>
                )}
                {selectedUser.country && (
                  <View className="flex-row justify-between">
                    <Text className="font-pmedium text-gray-600">Country:</Text>
                    <Text className="font-pregular text-gray-800">{selectedUser.country}</Text>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Last Login:</Text>
                  <Text className="font-pregular text-gray-800">{formatDateTime(selectedUser.last_login)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Joined:</Text>
                  <Text className="font-pregular text-gray-800">{formatDateTime(selectedUser.created_at)}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              className="mt-6 py-3 rounded-lg border border-gray-300 bg-white"
              onPress={() => setShowUserDetails(false)}>
              <Text className="text-gray-700 text-center font-pmedium">Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderAdminDetailsModal = () => (
    <Modal
      visible={showAdminDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAdminDetails(false)}>
      <View className="flex-1 justify-center bg-black/50 p-6">
        <View className="bg-white rounded-2xl p-6 max-h-[80%]">
          <ScrollView>
            <Text className="text-xl font-pbold mb-4 text-gray-800 text-center">
              Admin Details
            </Text>
            
            {selectedAdmin && (
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Username:</Text>
                  <Text className="font-pregular text-gray-800">{selectedAdmin.username}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Email:</Text>
                  <Text className="font-pregular text-gray-800">{selectedAdmin.email}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Phone:</Text>
                  <Text className="font-pregular text-gray-800">{selectedAdmin.phone || 'Not provided'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Role:</Text>
                  <Text className="font-pregular text-gray-800 capitalize">{selectedAdmin.role}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Status:</Text>
                  <Text className="font-pregular text-gray-800 capitalize">{selectedAdmin.status}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Registration:</Text>
                  <Text className="font-pregular text-gray-800 capitalize">{selectedAdmin.registration_status}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Verified:</Text>
                  <Text className="font-pregular text-gray-800">{selectedAdmin.is_verified ? 'Yes' : 'No'}</Text>
                </View>
                {selectedAdmin.country && (
                  <View className="flex-row justify-between">
                    <Text className="font-pmedium text-gray-600">Country:</Text>
                    <Text className="font-pregular text-gray-800">{selectedAdmin.country}</Text>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Last Login:</Text>
                  <Text className="font-pregular text-gray-800">{formatDateTime(selectedAdmin.last_login)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-pmedium text-gray-600">Joined:</Text>
                  <Text className="font-pregular text-gray-800">{formatDateTime(selectedAdmin.created_at)}</Text>
                </View>
                {currentAdmin && selectedAdmin.id === currentAdmin.id && (
                  <View className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                    <Text className="text-blue-700 text-sm font-pmedium text-center">
                      This is your account
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg border border-gray-300 bg-white"
                onPress={() => setShowAdminDetails(false)}>
                <Text className="text-gray-700 text-center font-pmedium">Close</Text>
              </TouchableOpacity>
              {selectedAdmin && canDeleteAdmin(selectedAdmin.id) && (
                <TouchableOpacity
                  className="flex-1 py-3 rounded-lg border border-red-600 bg-red-100"
                  onPress={() => {
                    setShowAdminDetails(false);
                    handleAdminAction(selectedAdmin.id, 'delete');
                  }}>
                  <Text className="text-red-700 text-center font-pmedium">Delete Admin</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderFactCheckerDetailsModal = () => (
    <Modal
      visible={showFactCheckerDetails}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        setShowFactCheckerDetails(false);
        setFactCheckerClaims([]);
      }}>
      <View className="flex-1 bg-white">
        <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-pbold text-gray-800">Fact Checker Details</Text>
            <TouchableOpacity
              onPress={() => {
                setShowFactCheckerDetails(false);
                setFactCheckerClaims([]);
              }}
              className="p-2">
              <Text className="text-gray-600 font-pbold text-lg">✕</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-pbold mb-4 text-gray-800 text-center">
              Fact Checker Details
            </Text>
            
            {selectedFactChecker && (
              <View className="space-y-3">
                {/* Basic Info */}
                <View className="mb-3 pb-3 border-b border-gray-200">
                  <Text className="text-base font-pbold text-gray-800 mb-2">Basic Information</Text>
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-pmedium text-gray-600 text-sm">Username:</Text>
                    <Text className="font-pregular text-gray-800 text-sm flex-1 text-right" numberOfLines={1}>
                      {selectedFactChecker.username}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-pmedium text-gray-600 text-sm">Email:</Text>
                    <Text className="font-pregular text-gray-800 text-sm flex-1 text-right" numberOfLines={1}>
                      {selectedFactChecker.email}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-pmedium text-gray-600 text-sm">Phone:</Text>
                    <Text className="font-pregular text-gray-800 text-sm">{selectedFactChecker.phone || 'Not provided'}</Text>
                  </View>
                </View>

                {/* Performance Stats */}
                <View className="mb-3 pb-3 border-b border-gray-200">
                  <Text className="text-base font-pbold text-gray-800 mb-2">Performance</Text>
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-pmedium text-gray-600 text-sm">Total Claims Worked:</Text>
                    <Text className="font-pregular text-gray-800 text-sm">{factCheckerClaims.length}</Text>
                  </View>
                </View>

                {/* Claims Reviewed */}
                <View className="mb-3">
                  <Text className="text-base font-pbold text-gray-800 mb-3">
                    Claims Worked ({factCheckerClaims.length})
                  </Text>
                  
                  {loadingClaims ? (
                    <View className="py-4">
                      <ActivityIndicator size="small" color="#0A864D" />
                      <Text className="text-gray-500 text-center text-sm mt-2">Loading claims...</Text>
                    </View>
                  ) : factCheckerClaims.length === 0 ? (
                    <View className="bg-gray-50 rounded-lg p-4">
                      <Text className="text-gray-500 text-center text-sm">
                        No claims worked yet
                      </Text>
                    </View>
                  ) : (
                    <View className="space-y-2">
                      {factCheckerClaims.map((claim, index) => (
                        <TouchableOpacity
                          key={claim.id || index}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                          onPress={() => handleViewClaim(claim.id)}>
                          <View className="flex-row items-start justify-between mb-2">
                            <Text className="font-pmedium text-gray-800 text-sm flex-1 pr-2" numberOfLines={2}>
                              {claim.title || 'Untitled Claim'}
                            </Text>
                            <View className={`px-2 py-1 rounded ${
                              claim.verdict === 'true' || claim.verdict === 'verified' ? 'bg-green-100' :
                              claim.verdict === 'false' ? 'bg-red-100' :
                              claim.verdict === 'misleading' ? 'bg-orange-100' :
                              'bg-yellow-100'
                            }`}>
                              <Text className={`text-xs font-pmedium ${
                                claim.verdict === 'true' || claim.verdict === 'verified' ? 'text-green-700' :
                                claim.verdict === 'false' ? 'text-red-700' :
                                claim.verdict === 'misleading' ? 'text-orange-700' :
                                'text-yellow-700'
                              }`}>
                                {claim.verdict?.toUpperCase() || 'PENDING'}
                              </Text>
                            </View>
                          </View>
                          
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-500 text-xs">
                              {claim.category || 'General'}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                              {claim.verdict_date ? formatDate(claim.verdict_date) : formatDate(claim.created_at)}
                            </Text>
                          </View>
                          <Text className="text-blue-600 text-xs mt-1 text-right">Tap to view details →</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

          </ScrollView>
      </View>
    </Modal>
  );

  const renderClaimDetailsModal = () => (
    <Modal
      visible={showClaimDetails}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        setShowClaimDetails(false);
        setSelectedClaim(null);
      }}>
      <View className="flex-1 bg-white">
        <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-pbold text-gray-800">Claim Details</Text>
            <TouchableOpacity
              onPress={() => {
                setShowClaimDetails(false);
                setSelectedClaim(null);
              }}
              className="p-2">
              <Text className="text-gray-600 font-pbold text-lg">✕</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
            
            {selectedClaim && (
              <View className="space-y-4">
                {/* Claim Title */}
                <View className="mb-3">
                  <Text className="text-base font-pbold text-gray-800 mb-2">Claim Title</Text>
                  <Text className="font-pregular text-gray-800 text-sm bg-gray-50 rounded-lg p-3 border border-gray-200">
                    {selectedClaim.title || 'No title provided'}
                  </Text>
                </View>

                {/* Claim Description */}
                <View className="mb-3">
                  <Text className="text-base font-pbold text-gray-800 mb-2">Claim Description</Text>
                  <Text className="font-pregular text-gray-800 text-sm bg-gray-50 rounded-lg p-3 border border-gray-200">
                    {selectedClaim.description || 'No description provided'}
                  </Text>
                </View>

                {/* Verdict Categorization */}
                {selectedClaim.verdict && (
                  <View className="mb-3">
                    <Text className="text-base font-pbold text-gray-800 mb-2">Verdict Category</Text>
                    <View className={`p-3 rounded-lg border ${
                      selectedClaim.verdict === 'true' || selectedClaim.verdict === 'verified' ? 'bg-green-100 border-green-200' :
                      selectedClaim.verdict === 'false' ? 'bg-red-100 border-red-200' :
                      selectedClaim.verdict === 'misleading' ? 'bg-orange-100 border-orange-200' :
                      'bg-yellow-100 border-yellow-200'
                    }`}>
                      <Text className={`font-pmedium text-sm ${
                        selectedClaim.verdict === 'true' || selectedClaim.verdict === 'verified' ? 'text-green-700' :
                        selectedClaim.verdict === 'false' ? 'text-red-700' :
                        selectedClaim.verdict === 'misleading' ? 'text-orange-700' :
                        'text-yellow-700'
                      }`}>
                        {selectedClaim.verdict?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Full Verdict (Written by Fact Checker) */}
                {((selectedClaim as any).explanation || selectedClaim.verdict_description || (selectedClaim as any).verdict_text || (selectedClaim as any).human_explanation || (selectedClaim as any).fact_checker_verdict || (selectedClaim as any).analysis || selectedClaim.aiSuggestion?.verdict) && (
                  <View className="mb-3">
                    <Text className="text-base font-pbold text-gray-800 mb-2">Full Verdict (Written by Fact Checker)</Text>
                    <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <RichTextRenderer 
                        text={(selectedClaim as any).explanation || selectedClaim.verdict_description || (selectedClaim as any).verdict_text || (selectedClaim as any).human_explanation || (selectedClaim as any).fact_checker_verdict || (selectedClaim as any).analysis || selectedClaim.aiSuggestion?.verdict || 'No detailed verdict provided.'}
                        isDark={false}
                      />
                    </View>
                  </View>
                )}

                {/* Additional Claim Details */}
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="font-pmedium text-gray-600 text-sm">Category:</Text>
                    <Text className="font-pregular text-gray-800 text-sm">{selectedClaim.category || 'General'}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="font-pmedium text-gray-600 text-sm">Status:</Text>
                    <Text className="font-pregular text-gray-800 text-sm capitalize">{selectedClaim.status || 'Unknown'}</Text>
                  </View>
                  {selectedClaim.verdict_date && (
                    <View className="flex-row justify-between">
                      <Text className="font-pmedium text-gray-600 text-sm">Reviewed:</Text>
                      <Text className="font-pregular text-gray-800 text-sm">{formatDateTimeFull(selectedClaim.verdict_date)}</Text>
                    </View>
                  )}
                  {selectedClaim.fact_checker && (
                    <View className="flex-row justify-between">
                      <Text className="font-pmedium text-gray-600 text-sm">Fact Checker:</Text>
                      <Text className="font-pregular text-gray-800 text-sm">{selectedClaim.fact_checker}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

          </ScrollView>
      </View>
    </Modal>
  );

  // Reset Password Modal with password visibility toggle
  const renderResetPasswordModal = () => (
    <Modal
      visible={showResetPassword}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowResetPassword(false);
        setResetNewPassword('');
        setResetConfirmPassword('');
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={() => {
        setShowResetPassword(false);
        setResetNewPassword('');
        setResetConfirmPassword('');
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }}>
        <View className="flex-1 justify-center bg-black/50 p-6">
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{width: '100%'}}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
            >
              <View className="bg-white rounded-2xl p-6 border border-gray-300">
                <Text className="text-xl font-pbold mb-4 text-gray-800 text-center">
                  Reset Password
                </Text>
                
                <StableTextInput
                  title="Email"
                  value={resetEmail}
                  placeholder=""
                  onChangeText={() => {}}
                  editable={false}
                />

                <View className="mb-4">
                  <Text className="text-sm font-pmedium text-gray-800 mb-1">New Password</Text>
                  <View 
                    className={`border-b-2 border-gray-300 flex-row items-center`}
                    style={{ paddingVertical: 0 }}>
                    <TextInput
                      ref={newPasswordInputRef}
                      className="text-gray-800 text-base font-pregular flex-1"
                      placeholder="Enter new password"
                      placeholderTextColor="#9CA3AF"
                      value={resetNewPassword}
                      onChangeText={setResetNewPassword}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={focusConfirmPassword}
                      autoCorrect={false}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 0,
                        margin: 0,
                        height: 40,
                        textAlignVertical: 'center',
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} className="ml-2">
                      <Image 
                        source={showNewPassword ? icons.eye : icons.eyeHide} 
                        style={{ width: 20, height: 20, tintColor: '#6B7280' }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-sm font-pmedium text-gray-800 mb-1">Confirm Password</Text>
                  <View 
                    className={`border-b-2 border-gray-300 flex-row items-center`}
                    style={{ paddingVertical: 0 }}>
                    <TextInput
                      ref={confirmPasswordInputRef}
                      className="text-gray-800 text-base font-pregular flex-1"
                      placeholder="Confirm new password"
                      placeholderTextColor="#9CA3AF"
                      value={resetConfirmPassword}
                      onChangeText={setResetConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      returnKeyType="done"
                      blurOnSubmit={true}
                      autoCorrect={false}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 0,
                        margin: 0,
                        height: 40,
                        textAlignVertical: 'center',
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-2">
                      <Image 
                        source={showConfirmPassword ? icons.eye : icons.eyeHide} 
                        style={{ width: 20, height: 20, tintColor: '#6B7280' }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-lg border border-gray-300 bg-white"
                    onPress={() => {
                      setShowResetPassword(false);
                      setResetNewPassword('');
                      setResetConfirmPassword('');
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                      setSelectedUser(null);
                      setSelectedFactChecker(null);
                      setSelectedAdmin(null);
                    }}>
                    <Text className="text-gray-700 text-center font-pmedium">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-lg border border-green-600"
                    style={{backgroundColor: '#0A864D'}}
                    onPress={handleResetPassword}
                    disabled={loading}>
                    <Text className="text-white text-center font-pbold">
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header-style Tab Navigation */}
      <View className="bg-white px-2 pt-12 pb-3 border-b border-gray-300 shadow-sm">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl md:text-2xl font-pbold text-gray-800">
            Admin Dashboard
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-red-100 px-4 py-2 rounded-lg border border-red-200 flex-row items-center">
              <Text className="text-red-700 font-pmedium text-sm">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation as Header - Updated to remove pending_claims */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {['overview', 'users', 'factcheckers', 'register', 'system'].map((tab) => (
              <TouchableOpacity
                key={tab}
                className="mx-1 py-2 px-3 rounded-lg border min-w-[70px]"
                style={{
                  backgroundColor: activeTab === tab ? '#0A864D' : '#f8f9fa',
                  borderColor: activeTab === tab ? '#0A864D' : '#d1d5db',
                }}
                onPress={() => setActiveTab(tab as any)}>
                <Text
                  className="text-center font-pmedium text-xs"
                  style={{color: activeTab === tab ? 'white' : '#374151'}}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={{flex: 1}}
          contentContainerStyle={{paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 100}}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          bounces={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6">
            <ActivityIndicator size="large" color="#0A864D" />
            <Text className="text-gray-800 font-pmedium mt-2">Loading...</Text>
          </View>
        </View>
      )}

      {/* Reset Password Modal */}
      {renderResetPasswordModal()}

      {/* Detail Modals */}
      {renderUserDetailsModal()}
      {renderAdminDetailsModal()}
      {renderFactCheckerDetailsModal()}
      {renderClaimDetailsModal()}
    </View>
  );
};

export default AdminDashboardScreen;