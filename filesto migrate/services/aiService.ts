import api from './api';

interface AIAnalysis {
  analysis: string;
  confidence_score: number;
  suggested_sources: Array<{
    url: string;
    title: string;
  }>;
  preliminary_verdict: string;
}

export const aiService = {
  checkClaim: async (claimText: string): Promise<AIAnalysis> => {
    const response = await api.post<{ success: boolean; data: AIAnalysis }>('/ai/check-claim', {
      claim_text: claimText,
    });
    return response.data.data;
  },
};
