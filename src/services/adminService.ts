import api from './api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface AdminStats {
  total_users: number;
  total_claims: number;
  pending_claims: number;
  verified_claims: number;
  total_fact_checkers: number;
  claims_this_month: number;
}

export const adminService = {
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<User[]> => {
    const response = await api.get<{ success: boolean; data: { users: User[] } }>(
      '/admin/users',
      { params }
    );
    return response.data.data.users;
  },

  assignRole: async (userId: string, role: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/role`, { role });
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<{ success: boolean; data: AdminStats }>('/admin/stats');
    return response.data.data;
  },

  deleteClaim: async (claimId: string): Promise<void> => {
    await api.delete(`/admin/claims/${claimId}`);
  },
};
