import api from './api';

export interface Claim {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'verified' | 'false' | 'misleading' | 'needs_context' | 'ai_verified';
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
  ai_verdict?: {
    id: string;
    verdict: string;
    explanation: string;
    confidence_score: number;
    sources?: Array<{ url: string; title: string }>;
    disclaimer?: string;
    is_edited_by_human?: boolean;
    created_at: string;
  };
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

  // Poll for AI verdict after claim submission (fast polling for instant feedback)
  async pollForAIVerdict(claimId: string, maxAttempts: number = 6, delayMs: number = 300): Promise<Claim> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const claim = await this.getClaimById(claimId);
        
        // Check if AI verdict is ready
        if (claim.ai_verdict && claim.ai_verdict.explanation) {
          console.log('✅ AI verdict ready!');
          return claim;
        }
        
        // Wait before next attempt (faster polling)
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`Poll attempt ${attempt + 1} failed:`, error);
      }
    }
    
    // Return the claim even if AI verdict isn't ready
    console.log('⚠️ AI verdict not ready after polling, returning claim anyway');
    return this.getClaimById(claimId);
  }

  // IMPROVED Normalize claim status to ensure consistent handling
  private normalizeClaimStatus(claim: any): Claim {
    // Check if AI has provided a verdict
    const hasAIVerdict = claim.ai_verdict && (claim.ai_verdict.explanation || claim.ai_verdict.verdict);
    
    // Check if human fact-checker has reviewed
    const hasHumanReview = claim.verdict || claim.verdictText || claim.human_explanation || claim.verdictDate;
    
    // Priority: Human review overrides AI verdict
    if (hasHumanReview) {
      // Mark that it's been reviewed by human
      claim.verified_by_ai = false;
      
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
        claim.status = 'verified';
      }
    }
    // If no human review but AI verdict exists, show AI verdict
    else if (hasAIVerdict) {
      claim.status = 'ai_verified';
      claim.verified_by_ai = true;
      
      // Set verdictText from AI explanation for display
      if (claim.ai_verdict.explanation && !claim.verdictText) {
        claim.verdictText = claim.ai_verdict.explanation;
      }
      
      // Set verdict from AI verdict if not already set
      if (claim.ai_verdict.verdict && !claim.verdict) {
        const aiVerdictLower = claim.ai_verdict.verdict.toLowerCase();
        if (aiVerdictLower.includes('true') || aiVerdictLower.includes('correct') || aiVerdictLower.includes('accurate')) {
          claim.verdict = 'true';
        } else if (aiVerdictLower.includes('false') || aiVerdictLower.includes('incorrect') || aiVerdictLower.includes('inaccurate')) {
          claim.verdict = 'false';
        } else if (aiVerdictLower.includes('misleading') || aiVerdictLower.includes('partial')) {
          claim.verdict = 'misleading';
        } else {
          claim.verdict = 'needs_context';
        }
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