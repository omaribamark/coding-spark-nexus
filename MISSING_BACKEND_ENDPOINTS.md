# Missing Backend Endpoints Documentation

This document outlines all backend endpoints needed for HAKIKISHA platform.

## Critical AI Integration Endpoints

### POST `/api/v1/ai/chat`
**Purpose:** Handle AI conversations with POE API

**Implementation:**
```javascript
const { OpenAI } = require("openai");

app.post('/api/v1/ai/chat', async (req, res) => {
  const apiKey = "ZceEiyLZg4JbvhV8UDpnY0rMT037Pi4QIhdPy4pirRA";
  const openai = new OpenAI({
    apiKey,
    baseURL: "https://api.poe.com/v1",
  });

  const response = await openai.chat.completions.create({
    model: "Election_Assistant",
    messages: [{ role: "user", content: req.body.prompt }],
  });

  res.json({
    success: true,
    response: response.choices[0].message.content
  });
});
```

### POST `/api/v1/ai/fact-check`
**Purpose:** AI fact-checking for submitted claims
**Uses same POE API implementation**

## Authentication with Email/Username

### POST `/api/v1/auth/login`
**Must accept email OR username as identifier**

```json
{
  "identifier": "email@example.com or username",
  "password": "password123"
}
```

## Registration with Phone & Country

### POST `/api/v1/auth/register`
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Full Name",
  "phone_number": "+254700000000",
  "country": "Kenya"
}
```

See full endpoint documentation in BACKEND_ENDPOINTS_DOCUMENTATION.md

## Potentially Missing Endpoints

### 1. Password Reset Flow (REQUIRED - NOW IMPLEMENTED IN APP)

**Endpoint:** `POST /api/v1/auth/forgot-password`
**Status:** ⚠️ MUST BE IMPLEMENTED - Mobile app now calls this endpoint
**Purpose:** Initiate password reset process and send reset link via email

**Implementation Requirements:**
- Generate a secure reset token (use crypto.randomBytes or similar)
- Store token in database with expiration time (recommended: 1 hour)
- Send email to user with reset link containing the token
- Reset link format: `hakikisha://reset-password?token={TOKEN}` (for deep linking to mobile app)
- Email should be sent using a service like Resend, SendGrid, or Mailgun
- Include user-friendly error messages for invalid emails

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, we've sent password reset instructions."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid email address" // or other user-friendly message
}
```

---

**Endpoint:** `POST /api/v1/auth/reset-password`
**Status:** ⚠️ MUST BE IMPLEMENTED
**Purpose:** Complete password reset using token from email

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid or expired reset token"
}
```

---

**Endpoint:** `POST /api/v1/user/change-password`
**Status:** ⚠️ MUST BE IMPLEMENTED
**Purpose:** Allow logged-in users to change their password

**Headers Required:**
```
Authorization: Bearer {user_token}
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

---

### 2. Claim Endpoints to Verify

Check if these exist and return the correct data structure:

- `GET /api/v1/claims/trending` should return:
  ```json
  {
    "success": true,
    "trendingClaims": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "category": "string",
        "status": "pending|ai_processing|human_review|resolved|rejected",
        "verdict": "true|false|misleading|unverifiable",
        "verdict_text": "string", // The fact-checker's detailed verdict
        "verdict_summary": "string", // Short summary
        "submittedDate": "ISO date string",
        "verdictDate": "ISO date string",
        "fact_checker": {
          "id": "string",
          "full_name": "string"
        },
        "sources": [
          {
            "url": "string",
            "title": "string"
          }
        ],
        "is_trending": true,
        "trending_score": 100,
        "submission_count": 5,
        "created_at": "ISO date",
        "updated_at": "ISO date"
      }
    ]
  }
  ```

- `GET /api/v1/claims/my-claims` should return user's submitted claims
- `GET /api/v1/claims/:id` should return full claim details including verdict_text and sources

### 3. User Profile Endpoints

Verify these endpoints exist:
- `GET /api/v1/user/profile` - Get current user profile
- `PUT /api/v1/user/profile` - Update user profile
  - Request: `{ full_name?: string, phone_number?: string, profile_picture?: string }`

### 4. Admin Endpoints

These should be at `/api/v1/admin/*` (not `/admin/*`):
- `GET /api/v1/admin/dashboard/stats`
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users/register-fact-checker`
- `POST /api/v1/admin/users/register-admin`
- `POST /api/v1/admin/users/action` - For suspend/activate/delete actions

### 5. Fact-Checker Endpoints

- `POST /api/v1/fact-checker/submit-verdict` should accept:
  ```json
  {
    "claimId": "string",
    "status": "verified|false|misleading|needs_context",
    "verdict": "string", // The detailed verdict text
    "sources": [
      {
        "url": "string",
        "title": "string"
      }
    ]
  }
  ```

## Database Schema Requirements

### Claims Table
Make sure the `claims` table has these columns:
- `verdict_text` (TEXT) - The detailed verdict from fact-checker
- `verdict_summary` (TEXT) - Short summary of verdict
- `fact_checker_id` (UUID) - Foreign key to users table
- `sources` (JSONB) - Array of source objects

### Example Query to Add Missing Columns:
```sql
-- Add verdict_text if missing
ALTER TABLE hakikisha.claims 
ADD COLUMN IF NOT EXISTS verdict_text TEXT,
ADD COLUMN IF NOT EXISTS verdict_summary TEXT,
ADD COLUMN IF NOT EXISTS fact_checker_id UUID REFERENCES hakikisha.users(id);

-- Add sources column if missing (if not already storing as JSONB)
ALTER TABLE hakikisha.claims
ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]';
```

## Testing Checklist

Once you've implemented the missing endpoints, test:

1. ✅ User can register and login
2. ✅ User can view their profile with real data
3. ✅ User can submit a claim
4. ✅ User can view their submitted claims
5. ✅ Trending claims show on home page
6. ✅ Claim details show correct status (pending/processing/resolved)
7. ✅ Resolved claims show verdict text and fact-checker name
8. ✅ Resolved claims show sources with clickable links
9. ✅ Dates display as "Jan 15, 2024 at 2:30 PM" not "2024-01-15T14:30:00.000Z"
10. ✅ Admin can register fact-checkers
11. ✅ Fact-checker can submit verdicts
12. ✅ User can logout
13. ✅ Password reset flow works

## API Response Format

All API responses should follow this format:
```json
{
  "success": true|false,
  "data": { ... },  // or "claims", "claim", etc.
  "message": "Success message",
  "error": "Error message if failed"
}
```
