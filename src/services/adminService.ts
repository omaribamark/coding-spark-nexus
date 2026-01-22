import api from './api';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'user' | 'fact_checker' | 'admin';
  status: 'active' | 'suspended' | 'inactive';
  registration_status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  last_login: string;
  created_at: string;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

interface FactChecker {
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
}

interface DashboardStats {
  total_users: number;
  total_claims: number;
  pending_claims: number;
  verified_false_claims: number;
  active_fact_checkers: number;
  pending_registrations: number;
  total_blogs: number;
  total_admins: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  users?: T[];
  fact_checkers?: T[];
  admins?: T[];
  stats?: DashboardStats;
  user?: User;
  fact_checker?: FactChecker;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adminService = {
  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
    if (response.data.success && response.data.stats) {
      return response.data.stats;
    }
    throw new Error('Failed to fetch dashboard stats');
  },

  // User Management
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<User[]> => {
    const response = await api.get<ApiResponse<User>>('/admin/users', { params });
    if (response.data.success && response.data.users) {
      return response.data.users;
    }
    return [];
  },

  getUserDetails: async (userId: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${userId}`);
    if (response.data.success && response.data.user) {
      return response.data.user;
    }
    throw new Error('Failed to fetch user details');
  },

  updateUserStatus: async (userId: string, action: 'suspend' | 'activate' | 'approve', reason?: string): Promise<boolean> => {
    const response = await api.post<ApiResponse<any>>(`/admin/users/${userId}/actions`, {
      action,
      reason
    });
    return response.data.success || false;
  },

  resetUserPassword: async (userId: string, newPassword: string): Promise<boolean> => {
    const response = await api.post<ApiResponse<any>>(`/admin/users/${userId}/reset-password`, {
      newPassword
    });
    return response.data.success || false;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    const response = await api.delete<ApiResponse<any>>(`/admin/users/${userId}`);
    return response.data.success || false;
  },

  // Fact Checker Management
  getAllFactCheckers: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<FactChecker[]> => {
    const response = await api.get<ApiResponse<FactChecker>>('/admin/fact-checkers', { params });
    if (response.data.success && response.data.fact_checkers) {
      return response.data.fact_checkers;
    }
    return [];
  },

  getFactCheckerDetails: async (userId: string): Promise<FactChecker> => {
    const response = await api.get<ApiResponse<FactChecker>>(`/admin/fact-checkers/${userId}`);
    if (response.data.success && response.data.fact_checker) {
      return response.data.fact_checker;
    }
    throw new Error('Failed to fetch fact checker details');
  },

  getFactCheckerClaims: async (userId: string): Promise<any[]> => {
    const response = await api.get<ApiResponse<any>>(`/admin/fact-checkers/${userId}/claims`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  resetFactCheckerPassword: async (userId: string, newPassword: string): Promise<boolean> => {
    const response = await api.post<ApiResponse<any>>(`/admin/fact-checkers/${userId}/reset-password`, {
      newPassword
    });
    return response.data.success || false;
  },

  deleteFactChecker: async (userId: string): Promise<boolean> => {
    const response = await api.delete<ApiResponse<any>>(`/admin/fact-checkers/${userId}`);
    return response.data.success || false;
  },

  // Admin Management
  getAllAdmins: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<User[]> => {
    const response = await api.get<ApiResponse<User>>('/admin/admins', { params });
    if (response.data.success && response.data.admins) {
      return response.data.admins;
    }
    return [];
  },

  resetAdminPassword: async (userId: string, newPassword: string): Promise<boolean> => {
    const response = await api.post<ApiResponse<any>>(`/admin/admins/${userId}/reset-password`, {
      newPassword
    });
    return response.data.success || false;
  },

  // Registration
  registerUser: async (userData: {
    email: string;
    username: string;
    password: string;
    phone?: string;
    credentials?: string;
    areasOfExpertise?: string[];
    role: 'fact_checker' | 'admin';
  }): Promise<boolean> => {
    let endpoint = '';
    if (userData.role === 'fact_checker') {
      endpoint = '/admin/users/register-fact-checker';
    } else {
      endpoint = '/admin/users/register-admin';
    }

    const response = await api.post<ApiResponse<any>>(endpoint, userData);
    return response.data.success || false;
  },

  // System Actions
  getSystemHealth: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/admin/system/health');
    return response.data;
  },
};