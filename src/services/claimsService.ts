import api from './api';

export interface Claim {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'verified' | 'false' | 'misleading' | 'needs_context' | 'ai_verified' | 'completed' | 'unverifiable';
  verdict?: 'true' | 'false' | 'misleading' | 'verified' | 'needs_context' | 'unverifiable';
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

  // Get unread verdict count
  async getUnreadVerdictCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-verdicts');

      // Log raw response for debugging
      console.log('🔔 Unread verdicts API response:', response.data);

      if (response.data && response.data.success === false) {
        throw new Error(response.data.error || 'Failed to fetch unread verdict count');
      }

      const d = response.data;
      let count = 0;
      if (typeof d.unreadCount === 'number') count = d.unreadCount;
      else if (typeof d.count === 'number') count = d.count;
      else if (typeof d?.data?.unreadCount === 'number') count = d.data.unreadCount;
      else if (typeof d?.data?.count === 'number') count = d.data.count;
      else if (Array.isArray(d?.notifications)) count = d.notifications.length;
      else if (Array.isArray(d?.data?.verdicts)) count = d.data.verdicts.length;

      console.log('✅ Parsed unread verdict count:', count);
      return count;
    } catch (error: any) {
      console.error('❌ Error fetching unread verdict count:', error);
      return 0;
    }
  }

  // Mark verdict as read
  async markVerdictAsRead(claimId: string): Promise<void> {
    try {
      await api.post(`/notifications/verdicts/${claimId}/read`);
    } catch (error: any) {
      console.error('Error marking verdict as read:', error);
    }
  }

  // Poll for AI verdict after claim submission (fast polling for instant feedback)
  async pollForAIVerdict(claimId: string, maxAttempts: number = 6, delayMs: number = 300): Promise<Claim> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const claim = await this.getClaimById(claimId);
        
        // ✅ FIXED: Check if claim has AI verdict (immediate after submission)
        if (claim.ai_verdict && claim.ai_verdict.explanation) {
          console.log('✅ AI Verdict received!');
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

  // ✅ CORRECTED: Fixed normalizeClaimStatus to properly categorize AI vs Human verdicts
  private normalizeClaimStatus(claim: any): Claim {
    // Check if AI has provided a verdict
    const hasAIVerdict = claim.ai_verdict && (claim.ai_verdict.explanation || claim.ai_verdict.verdict);
    
    // Check if human fact-checker has reviewed (this should be explicit from backend)
    const hasHumanReview = claim.fact_checker || claim.human_explanation || claim.verdictDate;
    
    // ✅ FIXED: Clear logic for AI verdicts
    if (hasAIVerdict) {
      claim.verified_by_ai = true;
      
      // Set verdictText from AI explanation for display
      if (claim.ai_verdict.explanation && !claim.verdictText) {
        claim.verdictText = claim.ai_verdict.explanation;
      }
      
      // ✅ FIXED: Properly map AI verdict to claim verdict - check both verdict field AND explanation text
      if (!claim.verdict) {
        // Combine verdict field and explanation for analysis
        const aiVerdictText = (claim.ai_verdict.verdict || '').toLowerCase();
        const aiExplanationText = (claim.ai_verdict.explanation || '').toLowerCase();
        const fullAIText = aiVerdictText + ' ' + aiExplanationText;
        
        // Check for FALSE first (highest priority as user reported this issue)
        if (fullAIText.includes('false') || 
            fullAIText.includes('incorrect') || 
            fullAIText.includes('inaccurate') ||
            fullAIText.includes('untrue') ||
            fullAIText.includes('wrong') ||
            fullAIText.includes('not true') ||
            fullAIText.includes('is false')) {
          claim.verdict = 'false';
        } 
        // Check for TRUE
        else if (fullAIText.includes('true') || 
                   fullAIText.includes('correct') || 
                   fullAIText.includes('accurate') ||
                   fullAIText.includes('verified') ||
                   fullAIText.includes('is true')) {
          claim.verdict = 'true';
        }
        // Check for MISLEADING
        else if (fullAIText.includes('misleading') || 
                   fullAIText.includes('partial') ||
                   fullAIText.includes('exaggerated') ||
                   fullAIText.includes('distorted')) {
          claim.verdict = 'misleading';
        }
        // Check for NEEDS CONTEXT
        else if (fullAIText.includes('needs_context') ||
                   fullAIText.includes('unverifiable') ||
                   fullAIText.includes('insufficient') ||
                   fullAIText.includes('uncertain') ||
                   fullAIText.includes('needs context')) {
          claim.verdict = 'needs_context';
        } 
        // Default to needs_context if unclear
        else {
          claim.verdict = 'needs_context';
        }
      }
      
      // ✅ FIXED: Set status to ai_verified ONLY if no human review
      if (!hasHumanReview) {
        claim.status = 'ai_verified';
      }
    }
    
    // ✅ FIXED: Human review detection - only mark as human if explicit human review exists
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
    
    // ✅ FIXED: Handle 'completed' status - check if it was completed by AI or Human
    if (claim.status === 'completed') {
      if (hasAIVerdict && !hasHumanReview) {
        claim.status = 'ai_verified';
        claim.verified_by_ai = true;
      } else if (hasHumanReview) {
        claim.verified_by_ai = false;
        claim.status = 'verified'; // Or keep as completed if that's the final human status
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