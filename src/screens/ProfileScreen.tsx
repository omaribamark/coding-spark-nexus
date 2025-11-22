import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {icons} from '../constants';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CustomButton} from '../components';
import LineInputField from '../components/LineInputField';
import {userService} from '../services/userService';
import {getItem, removeItem} from '../utils/AsyncStorage';
import * as ImagePicker from 'react-native-image-picker';
import { useTheme } from '../context/ThemeContext';
import { Switch } from 'react-native';

type Props = {};

const ProfileScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { isDark, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showProfileSection, setShowProfileSection] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    points: 0,
    profile_picture: '',
    role: '',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getProfile();
      console.log('Profile data received:', data);
      
      // ✅ FIXED: Properly display phone number from registration
      setProfile({
        name: data.full_name || data.username || '',
        email: data.email || '',
        phone: data.phone_number || data.phone || '', // This now properly shows phone from registration
        country: '',
        points: data.points || 0,
        profile_picture: data.profile_picture || '',
        role: data.role || 'user',
      });
      
      console.log('Points display:', {
        points: data.points,
        current_streak: data.current_streak,
        longest_streak: data.longest_streak
      });
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      
      // Enhanced fallback to AsyncStorage
      try {
        const storedEmail = await getItem('userEmail');
        const storedName = await getItem('userName');
        
        if (storedEmail && typeof storedEmail === 'string') {
          setProfile(prev => ({...prev, email: storedEmail}));
        }
        if (storedName && typeof storedName === 'string') {
          setProfile(prev => ({...prev, name: storedName}));
        }
        
        // If we have some data but API failed, show warning
        if (storedEmail || storedName) {
          Alert.alert(
            'Warning', 
            'Could not fetch latest profile data. Showing cached information.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Error', 
            'Failed to load profile. Please check your connection.',
            [{ text: 'OK' }]
          );
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        Alert.alert('Error', 'Failed to load profile data.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleSelectProfilePicture = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => launchCamera(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => launchImageLibrary(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const launchImageLibrary = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets[0] && response.assets[0].uri) {
        const imageUri = response.assets[0].uri;
        await uploadProfilePicture(imageUri);
      }
    });
  };

  const launchCamera = () => {
    const options: ImagePicker.CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to take photo');
      } else if (response.assets && response.assets[0] && response.assets[0].uri) {
        const imageUri = response.assets[0].uri;
        await uploadProfilePicture(imageUri);
      }
    });
  };

  const uploadProfilePicture = async (imageUri: string) => {
    if (!imageUri) return;

    setUploadingImage(true);
    try {
      const result = await userService.uploadProfilePicture(imageUri);
      
      // Update local profile state with new picture
      setProfile(prev => ({
        ...prev,
        profile_picture: result.profile_picture,
      }));

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Upload profile picture error:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteProfilePicture();
              setProfile(prev => ({
                ...prev,
                profile_picture: '',
              }));
              Alert.alert('Success', 'Profile picture removed successfully!');
            } catch (error: any) {
              console.error('Delete profile picture error:', error);
              Alert.alert('Error', error.message || 'Failed to delete profile picture');
            }
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!profile.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      const updateData: any = {};
      if (profile.name) updateData.full_name = profile.name;
      if (profile.phone) updateData.phone_number = profile.phone;

      const updatedData = await userService.updateProfile(updateData);
      
      // Update local state with fresh data from server
      setProfile({
        ...profile,
        name: updatedData.full_name || updatedData.username || '',
        phone: updatedData.phone_number || updatedData.phone || '',
        points: updatedData.points || 0,
        profile_picture: updatedData.profile_picture || profile.profile_picture,
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.error || error.message || 'Failed to update profile'
      );
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await userService.changePassword(passwords.current, passwords.new);
      Alert.alert('Success', 'Password changed successfully');
      setPasswords({current: '', new: '', confirm: ''});
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error('Change password error:', error);
      Alert.alert('Error', error.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount();
              // Clear stored data
              await removeItem('userToken');
              await removeItem('userEmail');
              await removeItem('userName');
              
              Alert.alert('Success', 'Account deleted successfully');
              navigation.navigate('Login');
            } catch (error: any) {
              console.error('Delete account error:', error);
              Alert.alert(
                'Error', 
                error.response?.data?.error || error.message || 'Failed to delete account. Please try again.'
              );
            }
          },
        },
      ],
    );
  };

  const getPointsMessage = () => {
    if (profile.points === 0) {
      return 'Start earning points by using the app!';
    } else if (profile.points < 50) {
      return 'Keep going! You\'re building your points.';
    } else if (profile.points < 200) {
      return 'Great progress! Your points are growing.';
    } else {
      return 'Excellent! You\'re a points master!';
    }
  };

  const togglePasswordSection = () => {
    setShowPasswordSection(!showPasswordSection);
    // Clear password fields when closing
    if (showPasswordSection) {
      setPasswords({current: '', new: '', confirm: ''});
    }
  };

  const toggleProfileSection = () => {
    setShowProfileSection(!showProfileSection);
    // Exit edit mode when closing
    if (!showProfileSection && isEditing) {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'} items-center justify-center`}>
        <ActivityIndicator size="large" color="#0A864D" />
        <Text className={`${isDark ? 'text-white' : 'text-gray-600'} mt-4 font-pregular`}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#111827" : "#F8FAFC"} />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Picture */}
        <View className="items-center mt-6 mb-4">
          <TouchableOpacity
            onPress={handleSelectProfilePicture}
            disabled={uploadingImage}
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-full p-1 border relative`}>
            {uploadingImage ? (
              <View className={`w-24 h-24 rounded-full items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <ActivityIndicator size="small" color="#0A864D" />
                <Text className={`text-xs ${isDark ? 'text-white' : 'text-gray-500'} mt-2`}>Uploading...</Text>
              </View>
            ) : (
              <>
                <Image
                  source={profile.profile_picture ? {uri: profile.profile_picture} : icons.profile}
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
                <View
                  style={{backgroundColor: '#0A864D'}}
                  className={`absolute bottom-1 right-1 w-8 h-8 rounded-full items-center justify-center border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}>
                  <Image source={icons.pen} className="w-4 h-4" tintColor="white" />
                </View>
              </>
            )}
          </TouchableOpacity>
          
          {profile.profile_picture && (
            <TouchableOpacity
              onPress={handleDeleteProfilePicture}
              className="mt-2">
              <Text className="text-red-500 font-pmedium text-sm">Remove Photo</Text>
            </TouchableOpacity>
          )}
          
          <Text className={`${isDark ? 'text-white' : 'text-gray-500'} text-xs mt-2 font-pregular`}>
            Tap the camera icon to change your photo
          </Text>
        </View>

        <View className="px-6">
          {/* Dark Mode Toggle */}
          <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-4 mb-4 shadow-sm flex-row items-center justify-between border`}>
            <View className="flex-row items-center flex-1">
              <View className={`w-12 h-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} items-center justify-center mr-4`}>
                <Text className="text-xl">{isDark ? '🌙' : '☀️'}</Text>
              </View>
              <View className="flex-1">
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-psemibold text-base`}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text className={`${isDark ? 'text-white' : 'text-gray-500'} font-pregular text-xs mt-1`}>
                  Switch to {isDark ? 'light' : 'dark'} theme
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: '#0A864D' }}
              thumbColor={isDark ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          {/* Points Display - UPDATED WITHOUT STREAKS (Hidden for Admins and Fact Checkers) */}
          {profile.role !== 'admin' && profile.role !== 'fact_checker' && (
            <View className={`${isDark ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'} rounded-xl p-4 mb-4 border`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-600'} font-pmedium text-xs mb-1`}>Your Points</Text>
                  <Text className="text-3xl font-pbold" style={{color: '#EF9334'}}>
                    {profile.points}
                  </Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-600'} font-pregular text-xs mt-1`}>
                    {getPointsMessage()}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-4xl">🏆</Text>
                </View>
              </View>
              <Text className={`${isDark ? 'text-white' : 'text-gray-600'} font-pregular text-xs mt-2`}>
                Keep engaging with the app to earn more points!
              </Text>
            </View>
          )}

          {/* Profile Information - Collapsible */}
          <View className="mb-3">
            <TouchableOpacity 
              onPress={toggleProfileSection}
              className={`flex-row items-center justify-between p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
              <View className="flex-row items-center">
                <Image 
                  source={icons.profile} 
                  className="w-4 h-4 mr-3" 
                  tintColor="#0A864D"
                  resizeMode="contain"
                />
                <Text className={`text-base font-psemibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Profile Information
                </Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setIsEditing(!isEditing);
                  }}
                  className="mr-3"
                >
                  <Text className="text-[#0A864D] font-pmedium text-xs">
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Text>
                </TouchableOpacity>
                <Image 
                  source={icons.arrow_right} 
                  className={`w-4 h-4 ${showProfileSection ? 'rotate-90' : ''}`}
                  tintColor={isDark ? '#FFFFFF' : '#6B7280'}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            {showProfileSection && (
              <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4 mt-2`}>
                <View className="space-y-1">
                  <LineInputField
                    title="Name"
                    value={profile.name}
                    placeholder="Enter your name"
                    onChangeText={(text: string) => setProfile({...profile, name: text})}
                    fieldName="name"
                    focusedField={focusedField}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    editable={isEditing}
                  />

                  <LineInputField
                    title="Email"
                    value={profile.email}
                    placeholder="Enter your email"
                    onChangeText={(text: string) => setProfile({...profile, email: text})}
                    fieldName="email"
                    focusedField={focusedField}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    editable={false}
                  />

                  <LineInputField
                    title="Phone"
                    value={profile.phone}
                    placeholder="Enter your phone number"
                    onChangeText={(text: string) => setProfile({...profile, phone: text})}
                    fieldName="phone"
                    focusedField={focusedField}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    editable={isEditing}
                  />
                </View>

                {isEditing && (
                  <CustomButton
                    title="Save Changes"
                    handlePress={handleUpdateProfile}
                    containerStyle="py-3 mt-4"
                  />
                )}
              </View>
            )}
          </View>

          {/* About App Section - Collapsible (Hidden for Admins and Fact Checkers) */}
          {profile.role !== 'admin' && profile.role !== 'fact_checker' && (
            <View className="mb-3">
              <TouchableOpacity 
                onPress={() => navigation.navigate('AboutApp')}
                className={`flex-row items-center justify-between p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">ℹ️</Text>
                  <Text className={`text-base font-psemibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    About HAKIKISHA App
                  </Text>
                </View>
                <Image 
                  source={icons.arrow_right} 
                  className="w-4 h-4"
                  tintColor={isDark ? '#FFFFFF' : '#6B7280'}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Change Password Section - Collapsible */}
          <View className="mb-3">
            <TouchableOpacity 
              onPress={togglePasswordSection}
              className={`flex-row items-center justify-between p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
              <View className="flex-row items-center">
                <Image 
                  source={icons.lock} 
                  className="w-4 h-4 mr-3" 
                  tintColor="#0A864D"
                  resizeMode="contain"
                />
                <Text className={`text-base font-psemibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Change Password
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className={`${isDark ? 'text-white' : 'text-gray-500'} font-pregular text-xs mr-2`}>
                  {showPasswordSection ? 'Hide' : 'Show'}
                </Text>
                <Image 
                  source={icons.arrow_right} 
                  className={`w-4 h-4 ${showPasswordSection ? 'rotate-90' : ''}`}
                  tintColor={isDark ? '#FFFFFF' : '#6B7280'}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            {showPasswordSection && (
              <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4 mt-2`}>
                <Text className={`${isDark ? 'text-white' : 'text-gray-600'} font-pmedium text-sm mb-4`}>
                  Update your account password for security
                </Text>

                <View className="space-y-4">
                  <LineInputField
                    title="Current Password"
                    value={passwords.current}
                    placeholder="Enter current password"
                    onChangeText={(text: string) =>
                      setPasswords({...passwords, current: text})
                    }
                    secureTextEntry
                    fieldName="currentPassword"
                    focusedField={focusedField}
                    onFocus={() => setFocusedField('currentPassword')}
                    onBlur={() => setFocusedField(null)}
                  />

                  <LineInputField
                    title="New Password"
                    value={passwords.new}
                    placeholder="Enter new password"
                    onChangeText={(text: string) => setPasswords({...passwords, new: text})}
                    secureTextEntry
                    fieldName="newPassword"
                    focusedField={focusedField}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField(null)}
                  />

                  <LineInputField
                    title="Confirm New Password"
                    value={passwords.confirm}
                    placeholder="Confirm new password"
                    onChangeText={(text: string) =>
                      setPasswords({...passwords, confirm: text})
                    }
                    secureTextEntry
                    fieldName="confirmPassword"
                    focusedField={focusedField}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View className="flex-row space-x-3 mt-4">
                  <TouchableOpacity 
                    onPress={togglePasswordSection}
                    className={`flex-1 py-3 border ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded-lg`}>
                    <Text className={`${isDark ? 'text-white' : 'text-gray-600'} font-pmedium text-center text-sm`}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={handleChangePassword}
                    style={{backgroundColor: '#0A864D'}}
                    className="flex-1 py-3 rounded-lg">
                    <Text className="text-white font-pmedium text-center text-sm">
                      Update Password
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={async () => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await removeItem('userToken');
                        await removeItem('userEmail');
                        await removeItem('userName');
                        await removeItem('auth_token');
                        await removeItem('user_data');
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Login' }],
                        });
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    },
                  },
                ]
              );
            }}
            style={{backgroundColor: '#EF9334'}} 
            className="rounded-xl p-4 mb-4">
            <Text className="text-white font-pbold text-center text-base">Logout</Text>
          </TouchableOpacity>

          {/* Danger Zone */}
          <View className="mb-6">
            <Text className="text-base font-psemibold text-red-600 mb-3">
              Danger Zone
            </Text>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className={`${isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200'} rounded-xl p-4 border`}>
              <Text className="text-red-600 font-pmedium text-center text-sm">
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;