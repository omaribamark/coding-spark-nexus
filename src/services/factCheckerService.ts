import api from './api';

interface PendingClaim {
  id: string;
  title: string;
  description: string;
  category: string;
  submitted_by: {
    id: string;
    full_name: string;
  };
  submitted_date: string;
  sources?: Array<{
    url: string;
    title: string;
  }>;
  ai_suggestion?: {
    status: 'verified' | 'false' | 'misleading' | 'needs_context';
    verdict: string;
    confidence: number;
    sources: string[];
    analyzed_at: string;
  };
}

interface VerdictData {
  status: 'verified' | 'false' | 'misleading' | 'needs_context';
  verdict: string;
  sources: Array<{
    url: string;
    title: string;
  }>;
  time_spent?: number;
}

interface FactCheckerStats {
  total_reviewed: number;
  pending_review: number;
  verified_true: number;
  verified_false: number;
  misleading: number;
  needs_context: number;
  accuracy: string;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  author_name: string;
  published_at: string;
  created_at: string;
}

export const factCheckerService = {
  getPendingClaims: async (params?: { page?: number; limit?: number }): Promise<PendingClaim[]> => {
    const response = await api.get<{ success: boolean; data: { claims: PendingClaim[] } }>(
      '/fact-checker/pending-claims',
      { params }
    );
    return response.data.data?.claims || (response.data as any).claims || [];
  },

  submitVerdict: async (claimId: string, verdictData: VerdictData): Promise<void> => {
    await api.post(`/fact-checker/submit-verdict`, {
      claimId,
      ...verdictData
    });
  },

  approveAIVerdict: async (claimId: string, verdictData: any): Promise<void> => {
    await api.post(`/fact-checker/approve-ai-verdict`, {
      claimId,
      ...verdictData
    });
  },

  getAiSuggestions: async (): Promise<PendingClaim[]> => {
    const response = await api.get<{ success: boolean; data: { claims: PendingClaim[] } }>('/fact-checker/ai-suggestions');
    return response.data.data?.claims || (response.data as any).claims || [];
  },

  getStats: async (): Promise<FactCheckerStats> => {
    const response = await api.get<{ success: boolean; data: FactCheckerStats }>('/fact-checker/stats');
    return response.data.data || (response.data as any).stats || response.data;
  },

  // Blog related services
  createBlog: async (blogData: {
    title: string;
    content: string;
    category: string;
    status?: string;
  }): Promise<Blog> => {
    const response = await api.post<{ success: boolean; data: Blog }>('/blogs', blogData);
    return response.data.data || (response.data as any).blog;
  },

  getMyBlogs: async (): Promise<Blog[]> => {
    const response = await api.get<{ success: boolean; data: Blog[] }>('/blogs/user/my-blogs');
    return response.data.data || (response.data as any).blogs || [];
  },

  getAllBlogs: async (): Promise<Blog[]> => {
    const response = await api.get<{ success: boolean; data: Blog[] }>('/blogs');
    return response.data.data || (response.data as any).blogs || [];
  },

  publishBlog: async (blogId: string): Promise<Blog> => {
    const response = await api.post<{ success: boolean; data: Blog }>(`/blogs/${blogId}/publish`);
    return response.data.data || (response.data as any).blog;
  }
};