import api from './api';

export interface VerdictResponse {
  id: string;
  claim_id: string;
  user_id: string;
  response_text: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    username: string;
  };
}

class VerdictResponseService {
  // Submit a response to a verdict
  async submitResponse(claimId: string, responseText: string): Promise<VerdictResponse> {
    try {
      const response = await api.post(`/claims/${claimId}/verdict-response`, {
        response_text: responseText
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to submit response');
      }

      return response.data.response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to submit response');
    }
  }

  // Get all responses for a claim
  async getClaimResponses(claimId: string): Promise<VerdictResponse[]> {
    try {
      const response = await api.get(`/claims/${claimId}/verdict-responses`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch responses');
      }

      return response.data.responses || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch responses');
    }
  }
}

export const verdictResponseService = new VerdictResponseService();
export default verdictResponseService;
