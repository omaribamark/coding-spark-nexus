import api from './api';

export interface Claim {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'verified' | 'false' | 'misleading' | 'needs_context';
  verdict?: 'true' | 'false' | 'misleading' | 'verified' | 'needs_context';
  verdictText?: string;
  human_explanation?: string;
  submittedDate: string;
  verdictDate?: string;
  submittedBy?: string;
  sources?: Array<{
    url: string;
    title: string;
  }>;
  evidence_sources?: Array<{
    url: string;
    title: string;
  }>;
  created_at?: string;
  updated_at?: string;
  verified_by_ai?: boolean;
  ai_verdict?: string;
  fact_checker?: {
    id: string;
    name: string;
  };
}

export interface SubmitClaimData {
  category: string;
  claimText: string;
  videoLink?: string;
  sourceLink?: string;
  imageUrl?: string;
}

class ClaimsService {
  // Get user's own claims
  async getUserClaims(): Promise<Claim[]> {
    try {
      const response = await api.get('/claims/my-claims');
      
      if (!response.data.success) {
        throw new Error(response.data.error || response.data.message || 'Failed to fetch your claims');
      }

      // Normalize the claims data to ensure consistent status handling
      const claims = response.data.claims || [];
      return claims.map((claim: any) => this.normalizeClaimStatus(claim));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch your claims');
    }
  }

  // Get claim by ID
  async getClaimById(claimId: string): Promise<Claim> {
    try {
      const response = await api.get(`/claims/${claimId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || response.data.message || 'Failed to fetch claim');
      }

      if (!response.data.claim) {
        throw new Error('Claim data not found in response');
      }

      // Normalize the claim status
      return this.normalizeClaimStatus(response.data.claim);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch claim details');
    }
  }

  // Submit a new claim
  async submitClaim(claimData: SubmitClaimData): Promise<any> {
    try {
      const response = await api.post('/claims', claimData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || response.data.message || 'Claim submission failed');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to submit claim');
    }
  }

  // Get trending claims
  async getTrendingClaims(limit: number = 10): Promise<Claim[]> {
    try {
      const response = await api.get('/claims/trending', {
        params: { limit }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || response.data.message || 'Failed to fetch trending claims');
      }

      const claims = response.data.trendingClaims || [];
      return claims.map((claim: any) => this.normalizeClaimStatus(claim));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch trending claims');
    }
  }

  // Get all verified claims (public endpoint)
  async getAllVerifiedClaims(): Promise<Claim[]> {
    try {
      const response = await api.get('/claims/verified');
      
      if (!response.data.success) {
        throw new Error(response.data.error || response.data.message || 'Failed to fetch verified claims');
      }

      const claims = response.data.claims || [];
      return claims.map((claim: any) => this.normalizeClaimStatus(claim));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch verified claims');
    }
  }

  // Search claims
  async searchClaims(query: string, category: string | null = null): Promise<Claim[]> {
    try {
      const params: any = { q: query };
      if (category) {
        params.category = category;
      }

      const response = await api.get('/claims/search', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || response.data.message || 'Search failed');
      }

      const claims = response.data.results || [];
      return claims.map((claim: any) => this.normalizeClaimStatus(claim));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Search failed');
    }
  }

  // IMPROVED Normalize claim status to ensure consistent handling
  private normalizeClaimStatus(claim: any): Claim {
    // If claim has any verdict-related data, it's been reviewed
    const hasBeenReviewed = claim.verdict || claim.verdictText || claim.human_explanation || claim.verdictDate;
    
    if (hasBeenReviewed && claim.status === 'pending') {
      // Update status based on verdict or other review indicators
      if (claim.verdict) {
        switch (claim.verdict) {
          case 'true':
          case 'verified':
            claim.status = 'verified';
            break;
          case 'false':
            claim.status = 'false';
            break;
          case 'misleading':
            claim.status = 'misleading';
            break;
          case 'needs_context':
            claim.status = 'needs_context';
            break;
        }
      } else if (claim.verdictText || claim.human_explanation) {
        // If there's verdict text but no specific verdict, mark as reviewed
        claim.status = 'verified'; // Default to verified if we have explanation but no verdict
      }
    }

    // Ensure verdict is properly mapped for verified claims
    if (claim.status === 'verified' && !claim.verdict) {
      claim.verdict = 'true';
    }

    return claim;
  }
}

export const claimsService = new ClaimsService();
export default claimsService;