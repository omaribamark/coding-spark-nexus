# Hakikisha Frontend - Complete Documentation

## Project Overview
Hakikisha is a React Native fact-checking mobile application that connects to a backend API for managing claims, verdicts, blogs, and AI-powered fact-checking.

**Backend API URL:** `https://hakikisha-backend-0r1w.onrender.com`

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Feature Documentation](#feature-documentation)
3. [API Integration](#api-integration)
4. [Data Flow](#data-flow)
5. [Time Formatting](#time-formatting)
6. [Verdict System](#verdict-system)
7. [AI Integration](#ai-integration)
8. [Backend Requirements](#backend-requirements)

---

## Architecture Overview

### Technology Stack
- **Framework:** React Native
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **State Management:** React Hooks (useState, useEffect)
- **Storage:** AsyncStorage (for local caching and tokens)
- **HTTP Client:** Axios
- **Styling:** NativeWind (Tailwind CSS for React Native)

### Project Structure
```
src/
├── screens/           # Main screens (Login, Signup, Home, etc.)
├── tabs/             # Bottom tab screens (HomeTab, ClaimsTab, BlogsTab, AITab)
├── components/       # Reusable UI components
├── services/         # API service layers
├── utils/            # Utility functions (date formatting, etc.)
├── constants/        # Constants (icons, images, data)
└── context/          # React Context (Theme, etc.)
```

---

## Feature Documentation

### 1. Authentication System

#### Login Flow
- **Screen:** `LoginScreen.tsx`
- **Service:** `authService.ts`
- **Endpoint:** `POST /auth/login`
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "jwt_token_here",
      "refresh_token": "refresh_token_here",
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "role": "user"
      }
    }
  }
  ```
- **Storage:** Tokens stored in AsyncStorage
- **Navigation:** After login → HomeScreen

#### Signup Flow
- **Screen:** `SignupScreen.tsx`
- **Endpoint:** `POST /auth/register`
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "username": "johndoe"
  }
  ```

### 2. Claims System

#### Claim Submission
- **Screen:** `SubmitClaimScreen.tsx`
- **Service:** `claimsService.ts`
- **Endpoint:** `POST /claims`
- **Request:**
  ```json
  {
    "title": "Claim title",
    "description": "Claim description",
    "category": "Politics",
    "source_url": "https://source.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "claim_id",
      "title": "Claim title",
      "status": "pending",
      "ai_verdict": {
        "verdict": "false",
        "explanation": "AI analysis...",
        "confidence_score": 0.85,
        "sources": [...]
      }
    }
  }
  ```

#### Claims List
- **Tab:** `ClaimsListTab.tsx`
- **Endpoint:** `GET /claims/user`
- **Features:**
  - Shows user's submitted claims
  - Displays verdict status badges
  - Click to view details
  - Pull-to-refresh

#### Trending Claims
- **Tab:** `TrendingTab.tsx`
- **Screen:** `TrendingClaimsScreen.tsx`
- **Endpoint:** `GET /claims/trending`
- **Features:**
  - Community claims (all users)
  - Sorted by date
  - Verdict status display
  - AI vs Human verdict labeling

#### Claim Details
- **Screen:** `ClaimDetailsScreen.tsx`
- **Endpoint:** `GET /claims/:id`
- **Features:**
  - Full claim information
  - Verdict analysis (AI or Human)
  - Evidence sources (clickable links)
  - User responses
  - Confidence score (for AI verdicts)

### 3. Verdict System

#### Verdict Types
```typescript
type VerdictType = 'true' | 'false' | 'misleading' | 'needs_context' | 'unverifiable';
```

#### Verdict Status Detection
The app determines verdict status with this priority:
1. **AI Verdict** (checked first)
   - If `claim.ai_verdict.explanation` exists → AI verdict
   - Uses `claim.ai_verdict.verdict` for classification
2. **Human Verdict** (checked second)
   - If `claim.verdict` or `claim.verdictText` exists → Human verdict
3. **Default Status**
   - Falls back to `claim.status` (pending, in_review, etc.)

#### Verdict Display Colors
- **True/Verified:** Green (#0A864D)
- **False:** Red (#dc2626)
- **Misleading:** Orange (#EF9334)
- **Needs Context:** Blue (#3b82f6)
- **Pending:** Gray (#6b7280)

#### AI vs Human Labeling
In HomeTab and TrendingTab:
- Shows "AI Verdict" if `claim.ai_verdict.explanation` exists
- Shows "Human Verdict" if `claim.verdict` or `claim.verdictText` exists without AI verdict

### 4. AI Integration

#### AI Chat
- **Tab:** `AITab.tsx`
- **Service:** `aiService.ts`
- **Endpoint:** `POST /ai/chat`
- **Request:**
  ```json
  {
    "prompt": "User's question",
    "hasAttachments": false,
    "attachmentTypes": []
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "response": "AI response with analysis and sources"
  }
  ```

#### AI Response Formatting
The AI tab automatically formats responses:
- Removes numbered lists (1., 2., etc.) → Replaces with bullets (•)
- Removes double square brackets: `[[1]]` → `1`, `[[http://url]]` → `http://url`
- Removes numbering before URLs: `1. http://url` → `http://url`
- Makes topics (text before colons) bold and green
- Converts URLs to clickable blue links

#### AI Claim Verification
When a claim is submitted, the backend automatically runs AI analysis and returns:
```json
{
  "ai_verdict": {
    "verdict": "false",
    "explanation": "Detailed analysis...",
    "confidence_score": 0.85,
    "sources": [
      {
        "url": "https://source.com",
        "title": "Source Title"
      }
    ],
    "disclaimer": "This is an AI-generated response..."
  }
}
```

### 5. Blogs System

#### Blogs List
- **Tab:** `BlogsTab.tsx`
- **Service:** `blogService.ts`
- **Endpoint:** `GET /blogs`
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "blog_id",
        "title": "Blog Title",
        "excerpt": "Short description",
        "author": "Author Name",
        "published_date": "2025-01-15T10:30:00Z",
        "category": "Politics",
        "image_url": "https://image.url"
      }
    ]
  }
  ```

#### Blog Details
- **Screen:** `BlogDetailScreen.tsx`
- **Endpoint:** `GET /blogs/:id`
- **Features:**
  - Full blog content
  - Author information
  - Publication date/time
  - Category tags
  - Related blogs

### 6. User Profile

#### Profile Screen
- **Screen:** `ProfileScreen.tsx`
- **Service:** `userService.ts`
- **Endpoint:** `GET /users/profile`
- **Features:**
  - Profile picture
  - User information
  - Edit profile
  - Settings
  - Theme toggle (Dark/Light mode)

### 7. Fact Checker Dashboard

#### Fact Checker Interface
- **Screen:** `FactCheckerDashboardScreen.tsx`
- **Service:** `factCheckerService.ts`
- **Endpoint:** `GET /fact-checker/pending-claims`
- **Features:**
  - View pending claims
  - Assign claims to self
  - Submit verdicts
  - Add evidence sources
  - View claim history

---

## API Integration

### API Configuration
**File:** `src/config/api.config.ts`
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://hakikisha-backend-0r1w.onrender.com',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};
```

### API Service Layer
**File:** `src/services/api.ts`
```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      await AsyncStorage.removeItem('authToken');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Files
All services follow this pattern:
```typescript
// claimsService.ts
import api from './api';

export const claimsService = {
  getUserClaims: async () => {
    const response = await api.get('/claims/user');
    return response.data.data;
  },
  
  getClaimById: async (id: string) => {
    const response = await api.get(`/claims/${id}`);
    return response.data.data;
  },
  
  submitClaim: async (claimData: any) => {
    const response = await api.post('/claims', claimData);
    return response.data.data;
  }
};
```

---

## Data Flow

### 1. Claim Submission Flow
```
User Input (SubmitClaimScreen)
    ↓
claimsService.submitClaim()
    ↓
POST /claims (Backend API)
    ↓
Backend processes + AI analysis
    ↓
Response with AI verdict
    ↓
Update UI with result
    ↓
Navigate to Claim Details
```

### 2. Claims List Flow
```
Tab Load (ClaimsListTab)
    ↓
claimsService.getUserClaims()
    ↓
GET /claims/user (Backend API)
    ↓
Normalize claim data
    ↓
Detect AI vs Human verdicts
    ↓
Display with proper labels
```

### 3. AI Chat Flow
```
User Message (AITab)
    ↓
aiService.checkClaim()
    ↓
POST /ai/chat (Backend API)
    ↓
AI processes query
    ↓
Format response (remove [[]], numbers)
    ↓
Display in chat with clickable links
```

---

## Time Formatting

### Date Formatter Utility
**File:** `src/utils/dateFormatter.ts`

```typescript
/**
 * Formats date/time for display throughout the app
 */

// Relative time (e.g., "2 hours ago", "3 days ago")
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  // For older dates, show formatted date
  return formatDate(dateString);
};

// Short date format (e.g., "Jan 15, 2025")
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Full date and time (e.g., "January 15, 2025 at 10:30 AM")
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
```

### Time Display Locations
- **Fact Checker Dashboard:** Uses `formatRelativeTime()` for claim submission times
- **Blogs Tab:** Uses `formatDateTime()` for publication times
- **Claim Details:** Uses `formatDate()` for submitted/updated dates
- **Home Tab:** Uses `formatDate()` for community claims

---

## Verdict System

### Backend Expected Format
The backend should return claims with this structure:

```json
{
  "id": "claim_id",
  "title": "Claim statement",
  "description": "Additional details",
  "category": "Politics",
  "status": "pending | in_review | completed",
  "submitted_date": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T14:00:00Z",
  
  // AI Verdict (if available)
  "ai_verdict": {
    "verdict": "false | true | misleading | needs_context",
    "explanation": "Detailed analysis with numbered sources...",
    "confidence_score": 0.85,
    "sources": [
      {
        "url": "https://source.com",
        "title": "Source Title"
      }
    ],
    "disclaimer": "This is an AI-generated response. Please verify with human fact-checkers."
  },
  
  // Human Verdict (if available)
  "verdict": "false | true | misleading | needs_context",
  "verdictText": "Human fact-checker analysis",
  "human_explanation": "Detailed human analysis",
  "evidence_sources": [
    {
      "url": "https://source.com",
      "title": "Source Title"
    }
  ],
  
  // Fact Checker Info (if human-reviewed)
  "fact_checker": {
    "id": "checker_id",
    "name": "John Doe"
  }
}
```

### Verdict Priority Logic
```typescript
const getFinalStatus = (claim: any) => {
  // Priority 1: AI verdict (check first)
  if (claim.ai_verdict && claim.ai_verdict.explanation) {
    return {
      status: 'ai_verified',
      verdict: claim.ai_verdict.verdict,
      isAI: true
    };
  }
  
  // Priority 2: Human verdict
  if (claim.verdict || claim.verdictText) {
    return {
      status: claim.verdict,
      verdict: claim.verdict,
      isAI: false
    };
  }
  
  // Priority 3: Default status
  return {
    status: claim.status || 'pending',
    verdict: null,
    isAI: false
  };
};
```

---

## AI Integration

### AI Verdict Format
When a claim is submitted or analyzed by AI, the backend should return:

```json
{
  "ai_verdict": {
    "verdict": "false",
    "explanation": "1. Topic Analysis:\nThe claim states X, but evidence shows Y.\n\n2. Evidence Review:\nMultiple sources confirm [[1]] that...\n\nSources:\n1. https://source1.com\n2. https://source2.com",
    "confidence_score": 0.85,
    "sources": [
      {
        "url": "https://source1.com",
        "title": "Source 1 Title"
      },
      {
        "url": "https://source2.com",
        "title": "Source 2 Title"
      }
    ],
    "disclaimer": "This is an AI-generated response. While we strive for accuracy, please verify with official fact-checkers."
  }
}
```

### AI Response Formatting (Frontend)
The frontend automatically cleans up AI responses:
1. Removes numbered lists: `1. Text` → `• Text`
2. Removes double brackets: `[[1]]` → `1`, `[[http://url]]` → `http://url`
3. Removes numbering before URLs: `1. http://url` → `http://url`
4. Makes topics bold and green (text before colons)
5. Converts URLs to clickable links

**Component:** `RichTextRenderer.tsx`
```typescript
// Removes numbered lists
text = text.replace(/^\d+[\.)]\s*/gm, '• ');

// Removes double brackets
text = text.replace(/\[\[([^\]]+)\]\]/g, '$1');

// Removes numbering before URLs
text = text.replace(/^\d+[\.)]\s*(https?:\/\/)/gm, '$1');
```

---

## Backend Requirements

### Required API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

#### Claims
- `GET /claims/user` - Get user's claims
- `GET /claims/trending` - Get community claims (all users)
- `GET /claims/:id` - Get single claim details
- `POST /claims` - Submit new claim (with AI analysis)
- `PUT /claims/:id` - Update claim
- `DELETE /claims/:id` - Delete claim
- `POST /claims/:id/mark-read` - Mark verdict as read

#### AI
- `POST /ai/chat` - AI chat conversation
- `POST /ai/check-claim` - AI claim verification

#### Blogs
- `GET /blogs` - Get all blogs
- `GET /blogs/:id` - Get single blog
- `POST /blogs` - Create blog (admin)
- `PUT /blogs/:id` - Update blog (admin)
- `DELETE /blogs/:id` - Delete blog (admin)

#### Fact Checker (Role-based)
- `GET /fact-checker/pending-claims` - Get pending claims
- `GET /fact-checker/assigned-claims` - Get assigned claims
- `POST /fact-checker/assign/:id` - Assign claim
- `POST /fact-checker/verdict/:id` - Submit verdict

#### User
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/profile/picture` - Update profile picture
- `GET /users/notifications` - Get notifications
- `PUT /users/notifications/:id/read` - Mark notification as read

### Response Format
All endpoints should return:
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Authentication
- Use JWT tokens (access + refresh)
- Access token in Authorization header: `Bearer <token>`
- Refresh token endpoint for token renewal
- Return 401 for expired/invalid tokens

### CORS Configuration
Backend must allow:
```javascript
{
  origin: '*', // Or specific mobile app domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  headers: ['Content-Type', 'Authorization']
}
```

---

## Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Registration with new user
- [ ] Registration with existing email
- [ ] Token refresh on expiry
- [ ] Logout functionality

### Claims
- [ ] Submit new claim
- [ ] View user claims list
- [ ] View trending claims
- [ ] View claim details
- [ ] AI verdict appears correctly
- [ ] Human verdict appears correctly
- [ ] Verdict labels (AI vs Human) correct
- [ ] Time displays correctly ("X hours ago")
- [ ] Pull-to-refresh works

### AI
- [ ] Send message in AI chat
- [ ] Links are clickable
- [ ] Double brackets removed `[[1]]` → `1`
- [ ] URL numbering removed `1. http://` → `http://`
- [ ] Topics are bold and green
- [ ] Chat history persists
- [ ] Clear history works

### Blogs
- [ ] Blogs list loads
- [ ] Blog details display
- [ ] Publication time correct
- [ ] Author information shown
- [ ] Pull-to-refresh works

### UI/UX
- [ ] Dark mode toggle works
- [ ] All screens responsive
- [ ] Loading indicators show
- [ ] Error messages display
- [ ] Navigation works correctly
- [ ] Back button functionality

---

## Known Issues & Solutions

### Issue: Wrong verdict labels (AI showing as Human)
**Solution:** Updated `getFinalStatus()` in HomeTab.tsx to check AI verdict first before human verdict.

### Issue: False verdicts showing as "Needs Context"
**Solution:** Ensured verdict mapping correctly uses `claim.ai_verdict.verdict` value instead of defaulting.

### Issue: AI links have double brackets [[1]]
**Solution:** Added regex to remove `[[` and `]]` from AI responses in both AITab and RichTextRenderer.

### Issue: Time shows incorrectly in Fact Checker
**Solution:** Updated `formatRelativeTime()` to properly calculate time differences.

### Issue: Blog times show as "14:00"
**Solution:** Changed to use `formatDateTime()` which shows full date and time with AM/PM.

---

## Environment Variables (Backend)
Backend should have these configured:
```env
# API
PORT=3000
NODE_ENV=production
API_URL=https://hakikisha-backend-0r1w.onrender.com

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# AI
OPENAI_API_KEY=your_openai_key
# or
ANTHROPIC_API_KEY=your_anthropic_key

# CORS
ALLOWED_ORIGINS=*
```

---

## Deployment Notes

### Frontend (React Native)
1. **Android:** Build APK/AAB with `./gradlew assembleRelease`
2. **iOS:** Build with Xcode
3. **Environment:** Update API_CONFIG.BASE_URL for production

### Backend Considerations
1. Ensure HTTPS enabled
2. CORS configured for mobile
3. Rate limiting implemented
4. Database migrations applied
5. AI API keys configured
6. File storage configured (for images)

---

## Support & Contact
For backend integration questions, ensure:
1. All endpoints match documentation
2. Response format follows spec
3. Authentication headers included
4. CORS properly configured
5. Time zones use ISO 8601 format (UTC)

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Frontend Version:** React Native 0.73+
