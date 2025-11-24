import api from './api';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone_number: string;
  phone: string;
  role: string;
  profile_picture?: string;
  is_verified: boolean;
  registration_status: string;
  created_at: string;
  updated_at: string;
  points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
}

interface UpdateProfileData {
  full_name?: string;
  username?: string;
  phone_number?: string;
  phone?: string;
  profile_picture?: string;
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<{ success: boolean; data: UserProfile }>('/user/profile');
      if (!response.data.success) {
        throw new Error('Failed to fetch profile');
      }
      
      console.log('User service - Profile data:', {
        points: response.data.data.points,
        current_streak: response.data.data.current_streak,
        longest_streak: response.data.data.longest_streak
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    try {
      const response = await api.put<{ success: boolean; data: UserProfile }>('/user/profile', data);
      if (!response.data.success) {
        throw new Error('Failed to update profile');
      }
      
      console.log('User service - Updated profile data:', {
        points: response.data.data.points,
        current_streak: response.data.data.current_streak,
        longest_streak: response.data.data.longest_streak
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  uploadProfilePicture: async (imageUri: string): Promise<{ profile_picture: string }> => {
    try {
      const formData = new FormData();
      
      // Extract file name and type from URI
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Append the file to FormData
      formData.append('profile_picture', {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);

      const response = await api.post<{ 
        success: boolean; 
        data: { profile_picture: string };
        message: string;
      }>('/user/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success) {
        throw new Error('Failed to upload profile picture');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  },

  deleteProfilePicture: async (): Promise<void> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>('/user/profile-picture');
      if (!response.data.success) {
        throw new Error('Failed to delete profile picture');
      }
    } catch (error: any) {
      console.error('Delete profile picture error:', error);
      throw error;
    }
  },

  deleteAccount: async (): Promise<void> => {
    try {
      const response = await api.delete('/user/account');
      if (!response.data.success) {
        throw new Error('Failed to delete account');
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw error;
    }
  },

  // New method to get points specifically
  getPoints: async (): Promise<{ points: number; current_streak: number; longest_streak: number }> => {
    try {
      const response = await api.get<{ success: boolean; data: UserProfile }>('/user/profile');
      if (!response.data.success) {
        throw new Error('Failed to fetch points');
      }
      
      const pointsData = {
        points: response.data.data.points || 0,
        current_streak: response.data.data.current_streak || 0,
        longest_streak: response.data.data.longest_streak || 0
      };
      
      console.log('User service - Points data:', pointsData);
      
      return pointsData;
    } catch (error: any) {
      console.error('Get points error:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const response = await api.post('/user/change-password', {
        currentPassword,
        newPassword,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      throw error;
    }
  }
};