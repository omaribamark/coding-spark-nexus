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
} from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import {icons} from '../constants';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {};

type User = {
  id: string;
  username: string;
  email: string;
  phone: string;
  points: number;
  role: 'user' | 'fact_checker' | 'admin';
  status: 'active' | 'suspended';
  lastActive: string;
  joinDate: string;
  lastOnline: string;
};

type Claim = {
  id: string;
  title: string;
  category: string;
  status: 'verified' | 'false' | 'misleading' | 'needs_context' | 'pending';
  verifiedDate: string;
  submittedBy: string;
  factChecker?: string;
  description: string;
  submittedDate: string;
};

type Blog = {
  id: string;
  title: string;
  category: string;
  content: string;
  publishedBy: string;
  publishDate: string;
  views: number;
  likes: number;
};

type FactCheckerActivity = {
  id: string;
  username: string;
  email: string;
  phone: string;
  claimsVerified: number;
  timeSpent: string;
  lastActive: string;
  recentClaims: Claim[];
  joinDate: string;
  accuracy: string;
  blogsWritten: number;
  totalHours: { date: string; hours: number }[];
  monthlyStats: { month: string; claims: number; hours: number }[];
};

type DashboardStats = {
  totalUsers: number;
  totalClaims: number;
  pendingClaims: number;
  verifiedClaims: number;
  falseClaims: number;
  factCheckers: number;
  admins: number;
  totalBlogs: number;
};

// Custom Input Component
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
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-pmedium text-gray-800 mb-1">{title}</Text>
      <View 
        className={`border-b-2 ${isFocused ? 'border-[#0A864D]' : 'border-gray-300'} ${error ? 'border-red-500' : ''}`}
        style={{ paddingVertical: 0 }}>
        <TextInput
          ref={ref}
          className="text-gray-800 text-base font-pregular"
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
          style={{
            paddingVertical: 8,
            paddingHorizontal: 0,
            margin: 0,
            height: 40,
            textAlignVertical: 'center',
          }}
        />
      </View>
      {error && <Text className="text-red-500 text-xs font-pregular mt-1">{error}</Text>}
    </View>
  );
});

const AdminDashboardScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'factcheckers' | 'register' | 'system'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalClaims: 0,
    pendingClaims: 0,
    verifiedClaims: 0,
    falseClaims: 0,
    factCheckers: 0,
    admins: 0,
    totalBlogs: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [factCheckerActivity, setFactCheckerActivity] = useState<FactCheckerActivity[]>([]);
  
  // Registration form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhoneNumber, setRegisterPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('KE');
  const [country, setCountry] = useState<Country | null>(null);
  const [callingCode, setCallingCode] = useState('254');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [registerRole, setRegisterRole] = useState<'fact_checker' | 'admin'>('fact_checker');

  const onSelectCountry = (selectedCountry: Country) => {
    setCountry(selectedCountry);
    setCountryCode(selectedCountry.cca2);
    setCallingCode(String(selectedCountry.callingCode[0]));
    setShowCountryPicker(false);
  };
  
  const [selectedFactChecker, setSelectedFactChecker] = useState<FactCheckerActivity | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  
  // Reset password form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  // API Service functions using centralized api.ts
  const apiService = {
    async getDashboardStats(): Promise<DashboardStats> {
      try {
        const response = await api.get('/admin/dashboard/stats');
        return response.data.stats || response.data;
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        Alert.alert('Error', error.message || 'Failed to load dashboard stats');
        return {
          totalUsers: 0,
          totalClaims: 0,
          pendingClaims: 0,
          verifiedClaims: 0,
          falseClaims: 0,
          factCheckers: 0,
          admins: 0,
          totalBlogs: 0,
        };
      }
    },

    async getUsers(): Promise<User[]> {
      try {
        const response = await api.get('/admin/users');
        return response.data.users || [];
      } catch (error: any) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', error.message || 'Failed to load users');
        return [];
      }
    },

    async getFactCheckers(): Promise<FactCheckerActivity[]> {
      try {
        const response = await api.get('/admin/dashboard/fact-checker-activity');
        return response.data.activity || response.data.factCheckers || [];
      } catch (error: any) {
        console.error('Error fetching fact checkers:', error);
        return [];
      }
    },

    async registerUser(userData: {
      email: string;
      username: string;
      password: string;
      full_name: string;
      phone_number: string;
      country: string;
      role: 'fact_checker' | 'admin';
    }): Promise<boolean> {
      try {
        let endpoint = '';
        
        if (userData.role === 'fact_checker') {
          endpoint = '/admin/users/register-fact-checker';
        } else if (userData.role === 'admin') {
          endpoint = '/admin/users/register-admin';
        } else {
          throw new Error('Invalid role specified');
        }

        console.log(`Registering ${userData.role} with endpoint:`, endpoint);

        const requestBody = {
          email: userData.email,
          username: userData.username,
          full_name: userData.full_name,
          password: userData.password,
          phone_number: userData.phone_number,
          country: userData.country
        };

        await api.post(endpoint, requestBody);
        return true;
      } catch (error: any) {
        console.error('Error registering user:', error);
        throw error;
      }
    },

    async updateUserStatus(userId: string, action: 'suspend' | 'activate' | 'delete'): Promise<boolean> {
      try {
        await api.post('/admin/users/action', {
          userId,
          action
        });
        return true;
      } catch (error: any) {
        console.error('Error updating user status:', error);
        throw error;
      }
    },

    async resetPassword(email: string, newPassword: string): Promise<boolean> {
      try {
        await api.post('/auth/reset-password', { 
          email, 
          new_password: newPassword 
        });
        return true;
      } catch (error: any) {
        console.error('Error resetting password:', error);
        throw error;
      }
    },

    async deleteUser(userId: string): Promise<boolean> {
      try {
        await api.post('/admin/users/action', { 
          userId, 
          action: 'delete'
        });
        return true;
      } catch (error: any) {
        console.error('Error deleting user:', error);
        throw error;
      }
    },
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, factCheckersData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getUsers(),
        apiService.getFactCheckers(),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setFactCheckerActivity(factCheckersData);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async () => {
    if (!registerEmail || !registerUsername || !registerPassword || !registerPhoneNumber || !country) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Basic validation
    if (!registerEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (registerPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const success = await apiService.registerUser({
        email: registerEmail,
        username: registerUsername,
        full_name: registerUsername,
        password: registerPassword,
        phone_number: `+${callingCode}${registerPhoneNumber}`,
        country: country ? (typeof country.name === 'string' ? country.name : country.name.common || '') : '',
        role: registerRole,
      });
      
      if (success) {
        Alert.alert('Success', `${registerRole === 'fact_checker' ? 'Fact Checker' : 'Admin'} registered successfully`);
        // Reset form
        setRegisterEmail('');
        setRegisterUsername('');
        setRegisterPassword('');
        setRegisterPhoneNumber('');
        setCountry(null);
        setCountryCode('KE');
        setCallingCode('254');
        setRegisterRole('fact_checker');
        // Refresh data
        loadDashboardData();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Failed to register user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'delete' | 'activate' | 'reset_password') => {
    if (action === 'reset_password') {
      const user = users.find(u => u.id === userId);
      if (user) {
        setResetEmail(user.email);
        setResetNewPassword('');
        setResetConfirmPassword('');
        setShowResetPassword(true);
      }
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      if (action === 'suspend' || action === 'activate') {
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
      Alert.alert('Error', error.message || `Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleFactCheckerAction = async (factCheckerId: string, action: 'suspend' | 'activate' | 'reset_password') => {
    if (action === 'reset_password') {
      const fc = factCheckerActivity.find(f => f.id === factCheckerId);
      if (fc) {
        setResetEmail(fc.email);
        setResetNewPassword('');
        setResetConfirmPassword('');
        setShowResetPassword(true);
      }
      return;
    }

    setLoading(true);
    try {
      const success = await apiService.updateUserStatus(factCheckerId, action);
      
      if (success) {
        Alert.alert('Success', `Fact Checker ${action}${action === 'suspend' ? 'ed' : 'd'} successfully`);
        loadDashboardData();
      } else {
        Alert.alert('Error', `Failed to ${action} fact checker`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to ${action} fact checker`);
    } finally {
      setLoading(false);
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
      const success = await apiService.resetPassword(resetEmail, resetNewPassword);
      if (success) {
        Alert.alert('Success', 'Password reset successfully');
        setShowResetPassword(false);
        setResetEmail('');
        setResetNewPassword('');
        setResetConfirmPassword('');
      } else {
        Alert.alert('Error', 'Failed to reset password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemAction = async (action: string) => {
    setLoading(true);
    try {
      // Implement actual system actions here
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
      Alert.alert('Error', error.message || `Failed to ${action.replace('_', ' ')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Clear auth tokens and redirect to login
    // await clearAuthTokens();
    navigation.navigate('Login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#0A864D';
      case 'false': return '#dc2626';
      case 'misleading': return '#EF9334';
      case 'needs_context': return '#3b82f6';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'false': return 'False';
      case 'misleading': return 'Misleading';
      case 'needs_context': return 'Needs Context';
      case 'pending': return 'Pending';
      default: return status;
    }
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
                {stats.totalUsers}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Total Claims</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.totalClaims}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Pending</Text>
              <Text className="text-2xl font-pbold text-gray-800">{stats.pendingClaims}</Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Verified</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.verifiedClaims}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">False Claims</Text>
              <Text className="text-2xl font-pbold text-red-600">{stats.falseClaims}</Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Fact Checkers</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.factCheckers}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Total Blogs</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.totalBlogs}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <Text className="text-gray-600 font-pregular mb-2 text-sm">Admins</Text>
              <Text className="text-2xl font-pbold text-gray-800">
                {stats.admins}
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
      .sort((a, b) => b.points - a.points);

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
                  <Text className="text-gray-500 text-xs">Phone: {user.phone}</Text>
                  <Text className="text-gray-500 text-xs">Joined: {user.joinDate}</Text>
                  <Text className="text-gray-500 text-xs">Last Online: {user.lastOnline}</Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-2xl mr-1">🏆</Text>
                    <Text className="font-pbold text-lg text-gray-800">{user.points}</Text>
                  </View>
                  <Text className="text-gray-500 text-xs">Active: {user.lastActive}</Text>
                </View>
              </View>
              <View className="flex-row gap-2 mt-2">
                {user.status === 'active' ? (
                  <TouchableOpacity
                    className="flex-1 bg-red-100 py-2 rounded-lg border border-red-200"
                    onPress={() => handleUserAction(user.id, 'suspend')}>
                    <Text className="text-red-700 font-pmedium text-center text-xs">Suspend</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="flex-1 bg-green-100 py-2 rounded-lg border border-green-200"
                    onPress={() => handleUserAction(user.id, 'activate')}>
                    <Text className="text-green-700 font-pmedium text-center text-xs">Activate</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="flex-1 bg-blue-100 py-2 rounded-lg border border-blue-200"
                  onPress={() => handleUserAction(user.id, 'reset_password')}>
                  <Text className="text-blue-700 font-pmedium text-center text-xs">Reset Password</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-2 rounded-lg border border-gray-300"
                  onPress={() => handleUserAction(user.id, 'delete')}>
                  <Text className="text-gray-700 font-pmedium text-center text-xs">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderFactCheckers = () => (
    <View className="pb-6">
      <Text className="text-xl font-pbold mb-4 text-gray-800">
        Fact Checker Activity ({factCheckerActivity.length})
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0A864D" />
      ) : factCheckerActivity.length === 0 ? (
        <Text className="text-gray-500 text-center py-4">No fact checkers found</Text>
      ) : (
        factCheckerActivity.map(fc => (
          <TouchableOpacity
            key={fc.id}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200"
            onPress={() => setSelectedFactChecker(fc)}>
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="font-psemibold text-base mb-1 text-gray-800">{fc.username}</Text>
                <Text className="text-gray-600 text-xs mb-1">{fc.email}</Text>
                <Text className="text-gray-500 text-xs mb-1">Phone: {fc.phone}</Text>
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-500 text-xs mr-2">Joined: {fc.joinDate}</Text>
                  <Text className="text-gray-500 text-xs">Time: {fc.timeSpent}</Text>
                </View>
                <Text className="text-gray-500 text-xs">Accuracy: {fc.accuracy}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-500 mb-1">Last Active</Text>
                <Text className="font-pmedium text-xs text-gray-800">{fc.lastActive}</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-600 text-xs">Claims Verified</Text>
                <Text className="font-pbold text-lg text-gray-800">
                  {fc.claimsVerified}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="bg-blue-100 px-3 py-2 rounded-lg border border-blue-200"
                  onPress={() => setSelectedFactChecker(fc)}>
                  <Text className="text-blue-700 font-pmedium text-xs">View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-green-100 px-3 py-2 rounded-lg border border-green-200"
                  onPress={() => handleFactCheckerAction(fc.id, 'reset_password')}>
                  <Text className="text-green-700 font-pmedium text-xs">Reset Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

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
          title="Email"
          value={registerEmail}
          placeholder="email@example.com"
          onChangeText={setRegisterEmail}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={focusUsername}
        />

        <StableTextInput
          ref={usernameInputRef}
          title="Username"
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
          title="Password"
          value={registerPassword}
          placeholder="Password"
          onChangeText={setRegisterPassword}
          secureTextEntry={true}
          returnKeyType="done"
          blurOnSubmit={true}
        />

        {/* Centered Role Selection */}
        <View className="items-center mb-6">
          <Text className="font-pmedium mb-3 text-sm text-gray-800 text-center">
            Select Role
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
            disabled={loading}>
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
      
      <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-200">
        <Text className="font-psemibold text-lg mb-3 text-gray-800">
          Quick Actions
        </Text>
        
        <View className="flex-row flex-wrap">
          <TouchableOpacity
            className="w-1/2 p-2"
            onPress={() => handleSystemAction('backup')}
            disabled={loading}>
            <View className="bg-blue-50 rounded-2xl p-4 shadow-sm border border-blue-200">
              <Text className="text-blue-700 font-pregular mb-2 text-sm">System Backup</Text>
              <Text className="text-blue-800 font-pbold text-sm">Create Backup</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-1/2 p-2"
            onPress={() => handleSystemAction('clear_cache')}
            disabled={loading}>
            <View className="bg-green-50 rounded-2xl p-4 shadow-sm border border-green-200">
              <Text className="text-green-700 font-pregular mb-2 text-sm">Clear Cache</Text>
              <Text className="text-green-800 font-pbold text-sm">Clean System</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-1/2 p-2"
            onPress={() => handleSystemAction('update_system')}
            disabled={loading}>
            <View className="bg-orange-50 rounded-2xl p-4 shadow-sm border border-orange-200">
              <Text className="text-orange-700 font-pregular mb-2 text-sm">System Update</Text>
              <Text className="text-orange-800 font-pbold text-sm">Check Updates</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-1/2 p-2"
            onPress={() => handleSystemAction('generate_reports')}
            disabled={loading}>
            <View className="bg-purple-50 rounded-2xl p-4 shadow-sm border border-purple-200">
              <Text className="text-purple-700 font-pregular mb-2 text-sm">Generate Reports</Text>
              <Text className="text-purple-800 font-pbold text-sm">Create Reports</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
        <Text className="font-psemibold text-lg mb-3 text-gray-800">
          Admin Management
        </Text>
        
        {users.filter(u => u.role === 'admin').map(admin => (
          <View key={admin.id} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-300">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-pmedium text-sm text-gray-800">{admin.username}</Text>
                <Text className="text-gray-600 text-xs">{admin.email}</Text>
              </View>
              <TouchableOpacity
                className="bg-red-100 px-3 py-1 rounded-lg border border-red-200"
                onPress={() => handleUserAction(admin.id, 'reset_password')}>
                <Text className="text-red-700 font-pmedium text-xs">Reset Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header-style Tab Navigation */}
      <View className="bg-white px-4 pt-12 pb-3 border-b border-gray-300 shadow-sm">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-pbold text-gray-800">
            Admin Dashboard
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            <Image source={icons.profile} style={{width: 32, height: 32, tintColor: '#4B5563'}} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation as Header - Smaller buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="flex-1 mx-1 py-2 rounded-lg border"
            style={{
              backgroundColor: activeTab === 'overview' ? '#0A864D' : '#f8f9fa',
              borderColor: activeTab === 'overview' ? '#0A864D' : '#d1d5db',
            }}
            onPress={() => setActiveTab('overview')}>
            <Text
              className="text-center font-pmedium text-xs"
              style={{color: activeTab === 'overview' ? 'white' : '#374151'}}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 mx-1 py-2 rounded-lg border"
            style={{
              backgroundColor: activeTab === 'users' ? '#0A864D' : '#f8f9fa',
              borderColor: activeTab === 'users' ? '#0A864D' : '#d1d5db',
            }}
            onPress={() => setActiveTab('users')}>
            <Text
              className="text-center font-pmedium text-xs"
              style={{color: activeTab === 'users' ? 'white' : '#374151'}}>
              Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 mx-1 py-2 rounded-lg border"
            style={{
              backgroundColor: activeTab === 'factcheckers' ? '#0A864D' : '#f8f9fa',
              borderColor: activeTab === 'factcheckers' ? '#0A864D' : '#d1d5db',
            }}
            onPress={() => setActiveTab('factcheckers')}>
            <Text
              className="text-center font-pmedium text-xs"
              style={{color: activeTab === 'factcheckers' ? 'white' : '#374151'}}>
              Fact Checkers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 mx-1 py-2 rounded-lg border"
            style={{
              backgroundColor: activeTab === 'register' ? '#0A864D' : '#f8f9fa',
              borderColor: activeTab === 'register' ? '#0A864D' : '#d1d5db',
            }}
            onPress={() => setActiveTab('register')}>
            <Text
              className="text-center font-pmedium text-xs"
              style={{color: activeTab === 'register' ? 'white' : '#374151'}}>
              Register
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 mx-1 py-2 rounded-lg border"
            style={{
              backgroundColor: activeTab === 'system' ? '#0A864D' : '#f8f9fa',
              borderColor: activeTab === 'system' ? '#0A864D' : '#d1d5db',
            }}
            onPress={() => setActiveTab('system')}>
            <Text
              className="text-center font-pmedium text-xs"
              style={{color: activeTab === 'system' ? 'white' : '#374151'}}>
              System
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={{flex: 1}}
          contentContainerStyle={{paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 100}}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          bounces={true}
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
      <Modal
        visible={showResetPassword}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResetPassword(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setShowResetPassword(false)}>
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
                  />

                  <StableTextInput
                    ref={newPasswordInputRef}
                    title="New Password"
                    value={resetNewPassword}
                    placeholder="Enter new password"
                    onChangeText={setResetNewPassword}
                    secureTextEntry={true}
                    returnKeyType="next"
                    onSubmitEditing={focusConfirmPassword}
                  />

                  <StableTextInput
                    ref={confirmPasswordInputRef}
                    title="Confirm Password"
                    value={resetConfirmPassword}
                    placeholder="Confirm new password"
                    onChangeText={setResetConfirmPassword}
                    secureTextEntry={true}
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />

                  <View className="flex-row gap-3 mt-4">
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-lg border border-gray-300 bg-white"
                      onPress={() => setShowResetPassword(false)}>
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
    </View>
  );
};

export default AdminDashboardScreen;