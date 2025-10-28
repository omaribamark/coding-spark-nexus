// ========================================
// DEPRECATED: This file is no longer used.
// ========================================
// All claims data now comes from the backend API via src/services/claimsService.ts
// The app now connects to: https://hakikisha-backend.onrender.com/api/v1
// 
// Mock data has been removed and replaced with real backend API calls.
// See BACKEND_CONNECTION_STATUS.md for full details.

export type ClaimStatus = 'pending' | 'verified' | 'false' | 'misleading' | 'needs_context';
export type ClaimCategory = 'politics' | 'health' | 'economy' | 'education' | 'technology' | 'environment';

export interface Claim {
  id: string;
  title: string;
  description: string;
  category: ClaimCategory;
  status: ClaimStatus;
  submittedBy: string;
  submittedDate: string;
  verdictDate?: string;
  verdict?: string;
  sources?: string[];
  isTrending: boolean;
}

// Mock data removed - now using real backend API
export const mockClaims: Claim[] = [];

export const categories: {id: number; name: ClaimCategory}[] = [
  { id: 1, name: 'politics' },
  { id: 2, name: 'health' },
  { id: 3, name: 'economy' },
  { id: 4, name: 'education' },
  { id: 5, name: 'technology' },
  { id: 6, name: 'environment' },
];
