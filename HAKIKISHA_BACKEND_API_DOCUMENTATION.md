# HAKIKISHA Backend API Documentation

## Overview
This document provides comprehensive documentation for all backend endpoints, features, and integrations in the HAKIKISHA fact-checking mobile application.

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management](#user-management)
3. [Claims Management](#claims-management)
4. [Fact-Checker Endpoints](#fact-checker-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Verdict Response System](#verdict-response-system)
7. [Notifications](#notifications)
8. [AI Integration](#ai-integration)
9. [Database Schema](#database-schema)

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone_number": "+254700000000",
  "country": "Kenya"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

### POST /api/auth/login
Login to the system.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "phone_number": "+254700000000",
    "country": "Kenya"
  }
}
```

### POST /api/auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

## User Management

### GET /api/users/profile
Get current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "username": "johndoe",
    "phone_number": "+254700000000",
    "country": "Kenya",
    "role": "user",
    "points": 150,
    "profile_picture": "url_to_image"
  }
}
```

### PUT /api/users/profile
Update user profile.

**Request Body:**
```json
{
  "full_name": "John Updated",
  "phone_number": "+254711111111",
  "country": "Kenya"
}
```

### POST /api/users/profile-picture
Upload profile picture.

**Content-Type:** multipart/form-data

**Form Data:**
- `profile_picture`: File

### POST /api/users/change-password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## Claims Management

### POST /api/claims
Submit a new claim (requires authentication).

**Request Body:**
```json
{
  "category": "Politics",
  "claimText": "The claim text here",
  "videoLink": "https://youtube.com/...",
  "sourceLink": "https://source.com/...",
  "imageUrl": "base64_or_url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "claim": {
    "id": "uuid",
    "title": "The claim text here",
    "description": "The claim text here",
    "category": "Politics",
    "status": "pending",
    "submitted_by": "user_id",
    "created_at": "2025-01-15T10:00:00Z"
  },
  "claimId": "uuid"
}
```

**Note:** Upon submission, the claim is automatically sent to the Poe AI service for immediate AI fact-checking.

### GET /api/claims/my-claims
Get current user's submitted claims.

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim title",
      "description": "Claim description",
      "category": "Politics",
      "status": "ai_verified",
      "verdict": "false",
      "verdictText": "AI explanation here",
      "submittedDate": "2025-01-15",
      "ai_verdict": {
        "id": "uuid",
        "verdict": "False",
        "explanation": "Detailed AI analysis...",
        "confidence_score": 0.85,
        "sources": [
          {
            "url": "https://source1.com",
            "title": "Source Title"
          }
        ],
        "disclaimer": "This is an AI-generated response. CRECO is not responsible for any implications...",
        "is_edited_by_human": false,
        "created_at": "2025-01-15T10:05:00Z"
      }
    }
  ]
}
```

### GET /api/claims/:claimId
Get claim details by ID.

**Response:**
```json
{
  "success": true,
  "claim": {
    "id": "uuid",
    "title": "Claim title",
    "description": "Claim description",
    "category": "Politics",
    "status": "verified",
    "verdict": "false",
    "verdictText": "Human fact-checker explanation",
    "human_explanation": "Detailed human analysis",
    "submittedDate": "2025-01-15",
    "verdictDate": "2025-01-16",
    "submittedBy": "user_name",
    "imageUrl": "url_to_image",
    "sources": [
      {
        "url": "https://source.com",
        "title": "Source Title"
      }
    ],
    "fact_checker": {
      "id": "uuid",
      "name": "Fact Checker Name"
    },
    "ai_verdict": {
      "id": "uuid",
      "verdict": "False",
      "explanation": "AI analysis",
      "confidence_score": 0.85,
      "disclaimer": "AI-generated response disclaimer",
      "is_edited_by_human": true,
      "edited_by_fact_checker_id": "uuid",
      "edited_at": "2025-01-16T14:00:00Z"
    }
  }
}
```

### GET /api/claims/trending
Get trending claims.

**Query Parameters:**
- `limit` (optional): Number of claims to return (default: 10)

**Response:**
```json
{
  "success": true,
  "trendingClaims": [
    {
      "id": "uuid",
      "title": "Trending claim",
      "category": "Politics",
      "status": "verified",
      "submittedDate": "2025-01-15"
    }
  ]
}
```

### GET /api/claims/verified
Get all verified claims (public endpoint).

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Verified claim",
      "description": "Description",
      "category": "Politics",
      "status": "verified",
      "verdict": "true",
      "verdictText": "Explanation",
      "submittedDate": "2025-01-15",
      "verdictDate": "2025-01-16"
    }
  ]
}
```

### GET /api/claims/search
Search claims.

**Query Parameters:**
- `q`: Search query
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "uuid",
      "title": "Matching claim",
      "category": "Politics",
      "status": "verified"
    }
  ]
}
```

---

## Verdict Response System

### POST /api/claims/:claimId/verdict-response
Submit a user response to a verdict (requires authentication).

**Request Body:**
```json
{
  "response_text": "I agree with this verdict because..."
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "id": "uuid",
    "claim_id": "claim_uuid",
    "user_id": "user_uuid",
    "response_text": "I agree with this verdict because...",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### GET /api/claims/:claimId/verdict-responses
Get all user responses for a claim.

**Response:**
```json
{
  "success": true,
  "responses": [
    {
      "id": "uuid",
      "claim_id": "claim_uuid",
      "user_id": "user_uuid",
      "response_text": "User response text",
      "created_at": "2025-01-15T10:00:00Z",
      "user": {
        "id": "user_uuid",
        "full_name": "John Doe",
        "username": "johndoe"
      }
    }
  ]
}
```

**Note:** These responses are visible to fact-checkers and admins when reviewing claims.

---

## Notifications

### GET /api/notifications/unread-verdicts
Get count of unread verdicts for current user.

**Response:**
```json
{
  "success": true,
  "unreadCount": 3
}
```

### POST /api/notifications/verdicts/:claimId/read
Mark a verdict as read.

**Response:**
```json
{
  "success": true,
  "message": "Verdict marked as read"
}
```

---

## Fact-Checker Endpoints

### GET /api/fact-checker/pending-claims
Get claims pending fact-checker review (requires fact-checker role).

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim to review",
      "description": "Claim description",
      "category": "Politics",
      "submitted_by": {
        "id": "user_id",
        "full_name": "User Name"
      },
      "submitted_date": "2025-01-15",
      "imageUrl": "url_to_image_if_attached",
      "sources": [],
      "ai_suggestion": {
        "status": "false",
        "verdict": "This claim is false because...",
        "confidence": 0.85,
        "sources": ["source1", "source2"],
        "analyzed_at": "2025-01-15T10:05:00Z"
      }
    }
  ]
}
```

**Note:** Images attached to claims are now visible to fact-checkers in this endpoint.

### POST /api/fact-checker/submit-verdict
Submit a verdict for a claim.

**Request Body:**
```json
{
  "claimId": "claim_uuid",
  "status": "false",
  "verdict": "Detailed explanation of why claim is false",
  "sources": [
    {
      "url": "https://source.com",
      "title": "Source Title"
    }
  ],
  "time_spent": 300
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verdict submitted successfully",
  "responsibility": "creco"
}
```

**Note:** When a fact-checker submits a verdict without editing the AI verdict, `responsibility` is set to "ai". If they edit it, `responsibility` is set to "creco".

### POST /api/fact-checker/approve-ai-verdict
Approve an AI-generated verdict.

**Request Body:**
```json
{
  "claimId": "claim_uuid",
  "verdict": "AI verdict text",
  "sources": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI verdict approved",
  "responsibility": "ai"
}
```

### GET /api/fact-checker/stats
Get fact-checker statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_reviewed": 45,
    "pending_review": 12,
    "verified_true": 20,
    "verified_false": 15,
    "misleading": 8,
    "needs_context": 2,
    "accuracy": "88.9%"
  }
}
```

---

## Admin Endpoints

### GET /api/admin/dashboard/stats
Get dashboard statistics (requires admin role).

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_users": 1250,
    "total_claims": 890,
    "pending_claims": 45,
    "verified_false_claims": 320,
    "active_fact_checkers": 12,
    "pending_registrations": 5,
    "total_blogs": 23,
    "total_admins": 3
  }
}
```

### GET /api/admin/users
Get all users with filtering.

**Query Parameters:**
- `page`, `limit`, `role`, `status`, `search`

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "phone": "+254700000000",
      "country": "Kenya",
      "role": "user",
      "status": "active",
      "is_verified": true,
      "total_points": 150,
      "created_at": "2025-01-01"
    }
  ]
}
```

### GET /api/admin/fact-checkers
Get all fact-checkers.

**Response:**
```json
{
  "success": true,
  "fact_checkers": [
    {
      "id": "uuid",
      "user_id": "user_uuid",
      "email": "factchecker@example.com",
      "username": "factchecker1",
      "phone": "+254711111111",
      "credentials": "PhD in Political Science",
      "areas_of_expertise": ["Politics", "Economics"],
      "verification_status": "approved",
      "is_active": true,
      "verdicts_count": 45,
      "total_verdicts": 45,
      "avg_review_time": 1200,
      "created_at": "2025-01-01"
    }
  ]
}
```

### GET /api/admin/fact-checkers/:userId/claims
Get all claims reviewed by a specific fact-checker.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "claim_uuid",
      "title": "Claim title",
      "category": "Politics",
      "status": "verified",
      "verdict": "false",
      "verdictText": "Fact-checker explanation",
      "submittedDate": "2025-01-15",
      "verdictDate": "2025-01-16",
      "responsibility": "creco"
    }
  ]
}
```

**Note:** This endpoint allows admins to see all claims a fact-checker has worked on along with their verdicts.

### POST /api/admin/users/:userId/actions
Perform actions on users (suspend, activate, approve).

**Request Body:**
```json
{
  "action": "suspend",
  "reason": "Violating terms of service"
}
```

**Note:** Suspended fact-checkers cannot log into the system.

### POST /api/admin/users/register-fact-checker
Register a new fact-checker (admin only).

**Request Body:**
```json
{
  "email": "newchecker@example.com",
  "username": "newchecker",
  "password": "password123",
  "phone": "+254722222222",
  "credentials": "Master's in Journalism",
  "areasOfExpertise": ["Media", "Technology"]
}
```

---

## AI Integration

### Poe AI Configuration

**API Endpoint:** `https://api.poe.com/v1`

**Model:** `Web-Search`

**API Key:** `ZceEiyLZg4JbvhV8UDpnY0rMT037Pi4QIhdPy4pirRA`

**Implementation:**
```javascript
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.POE_API_KEY,
  baseURL: "https://api.poe.com/v1",
});

const response = await openai.chat.completions.create({
  model: "Web-Search",
  messages: [{ role: "user", content: prompt }],
});
```

### AI Verdict Flow

1. **User submits claim** → Immediately sent to Poe AI for analysis
2. **AI processes claim** → Returns verdict, explanation, confidence score, and sources
3. **AI verdict saved** → Stored in `ai_verdicts` table with disclaimer
4. **User receives AI verdict** → Displayed with disclaimer: "This is an AI-generated response. CRECO is not responsible for any implications..."
5. **Fact-checker reviews** → Can view AI verdict and either:
   - Approve it (responsibility: "ai")
   - Edit it (responsibility: "creco")
6. **Final verdict** → Stored in `verdicts` table with responsibility tracking

### AI Disclaimer

All AI-generated verdicts include this disclaimer:
```
"This is an AI-generated response. CRECO is not responsible for any implications. 
This analysis should be verified by our fact-checkers."
```

---

## Database Schema

### Tables Overview

#### users
- id (UUID, PK)
- email (unique)
- password_hash
- full_name
- username
- phone_number
- country
- role (user | fact_checker | admin)
- status (active | suspended | inactive)
- points (integer)
- profile_picture (text)
- created_at
- updated_at

#### claims
- id (UUID, PK)
- title (text)
- description (text)
- category (text)
- status (pending | ai_verified | verified | false | misleading | needs_context | completed)
- verdict (text, nullable)
- verdictText (text, nullable)
- human_explanation (text, nullable)
- submitted_by (UUID, FK → users.id)
- submitted_date (timestamp)
- verdict_date (timestamp, nullable)
- imageUrl (text, nullable)
- videoLink (text, nullable)
- sourceLink (text, nullable)
- verdict_read_at (timestamp, nullable) - NEW
- verdict_notified (boolean, default: false) - NEW
- created_at
- updated_at

#### ai_verdicts
- id (UUID, PK)
- claim_id (UUID, FK → claims.id)
- verdict (text)
- explanation (text)
- confidence_score (float)
- sources (JSON)
- disclaimer (text) - NEW
- is_edited_by_human (boolean, default: false) - NEW
- edited_by_fact_checker_id (UUID, FK → users.id, nullable) - NEW
- edited_at (timestamp, nullable) - NEW
- created_at
- updated_at

#### verdicts
- id (UUID, PK)
- claim_id (UUID, FK → claims.id)
- fact_checker_id (UUID, FK → users.id)
- verdict_text (text)
- status (verified | false | misleading | needs_context)
- sources (JSON)
- time_spent (integer)
- based_on_ai_verdict (boolean, default: false) - NEW
- responsibility (text: 'ai' | 'creco') - NEW
- created_at
- updated_at

#### verdict_responses
- id (UUID, PK)
- claim_id (UUID, FK → claims.id)
- user_id (UUID, FK → users.id)
- response_text (text)
- created_at
- updated_at

#### fact_checkers
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- credentials (text)
- areas_of_expertise (JSON)
- verification_status (pending | approved | rejected)
- is_active (boolean)
- is_featured (boolean)
- created_at
- updated_at

---

## Feedback & Contact

Users can contact fact-checkers via the feedback section in settings:

**Email:** kellynyachiro@gmail.com

**Purpose:** User feedback, questions, and concerns about fact-checking process

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here",
  "message": "User-friendly error message"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Claim submission: 10 requests per hour per user
- General API: 100 requests per minute per user

---

## Security Notes

1. All passwords are hashed using bcrypt
2. JWT tokens expire after 24 hours
3. Suspended fact-checkers cannot access the system
4. All endpoints require HTTPS in production
5. File uploads (images) are validated for type and size
6. Phone numbers are validated and stored with country codes

---

## Version History

**v1.0.0** (2025-01-15)
- Initial API documentation
- Authentication system
- Claims management
- AI integration with Poe AI
- Verdict response system
- Notification system
- Admin and fact-checker dashboards

---

For backend implementation or API key issues, contact the development team.
