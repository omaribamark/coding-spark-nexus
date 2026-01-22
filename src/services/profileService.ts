import api from './api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  profilePicture: string;
  createdAt: string;
}

interface UpdateProfileData {
  username?: string;
  phone?: string;
  bio?: string;
}

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<{ success: boolean; profile: UserProfile }>('/user/profile');
    return response.data.profile;
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await api.put<{ success: boolean; profile: UserProfile }>('/user/profile', data);
    return response.data.profile;
  },

  uploadProfilePicture: async (imageUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await api.post<{ success: boolean; imageUrl: string }>(
      '/user/profile-picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.imageUrl;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/user/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
