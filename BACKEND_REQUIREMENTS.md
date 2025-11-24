# HAKIKISHA Backend Implementation Requirements

This document outlines all the backend endpoints and features that need to be implemented for the Hakikisha mobile app to function correctly.

## Authentication Requirements

### 1. User Registration
**Endpoint:** `POST /api/auth/register`

**Requirements:**
- Username must be unique (no auto-appending numbers)
- Phone number must be exactly 9 digits starting with 7 or 1
- Store phone number with country code (e.g., +254700000000)
- Store country information
- Password must be hashed

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "phone_number": "+254700000000",
  "country": "Kenya"
}
```

**Validation:**
- Email: valid email format
- Username: unique, alphanumeric, 3-20 characters
- Password: minimum 6 characters
- Phone: exactly 9 digits after country code, starting with 7 or 1

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "phone_number": "+254700000000",
    "country": "Kenya",
    "role": "user"
  }
}
```

### 2. Login with Username or Email
**Endpoint:** `POST /api/auth/login`

**Requirements:**
- Support login with EITHER username OR email
- Check if account is suspended before allowing login
- Return proper error messages for suspended accounts

**Request Body:**
```json
{
  "identifier": "johndoe OR user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "phone_number": "+254700000000",
    "country": "Kenya",
    "role": "user",
    "points": 150,
    "status": "active"
  }
}
```

**Error Responses:**
- 401: Invalid credentials
- 403: Account suspended - "Your account has been suspended. Please contact support."
- 403: Pending approval - "Your account is pending admin approval."

---

## User Profile Management

### 1. Get User Profile
**Endpoint:** `GET /api/users/profile`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "phone_number": "+254700000000",
    "country": "Kenya",
    "role": "user",
    "points": 150,
    "profile_picture": "url",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### 2. Update User Profile
**Endpoint:** `PUT /api/users/profile`

**Requirements:**
- Update phone number (must validate: 9 digits starting with 7 or 1)
- Update country
- Update full_name

**Request Body:**
```json
{
  "full_name": "John Updated",
  "phone_number": "+254711111111",
  "country": "Kenya"
}
```

---

## Claims Management

### 1. Submit Claim
**Endpoint:** `POST /api/claims`

**Requirements:**
- Store claim with correct timestamp (ISO 8601 format with timezone)
- Store attached images
- Trigger AI fact-checking immediately
- Award points to user for submission

**Request Body:**
```json
{
  "category": "Politics",
  "claimText": "The claim text",
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
    "title": "The claim text",
    "category": "Politics",
    "status": "pending",
    "submitted_by": "user_id",
    "created_at": "2025-01-15T10:30:45.123Z",
    "images": ["url1", "url2"]
  }
}
```

### 2. Get User's Claims
**Endpoint:** `GET /api/claims/my-claims`

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim text",
      "category": "Politics",
      "status": "pending",
      "verdict": "verified",
      "created_at": "2025-01-15T10:30:45.123Z",
      "updated_at": "2025-01-15T11:45:20.456Z",
      "images": ["url1", "url2"],
      "has_unread_verdict": true
    }
  ]
}
```

### 3. Get Claim Details
**Endpoint:** `GET /api/claims/:claimId`

**Response:**
```json
{
  "success": true,
  "claim": {
    "id": "uuid",
    "title": "Claim text",
    "description": "Full description",
    "category": "Politics",
    "status": "verified",
    "submitted_by": "user_id",
    "created_at": "2025-01-15T10:30:45.123Z",
    "updated_at": "2025-01-15T11:45:20.456Z",
    "images": ["url1", "url2"],
    "ai_verdict": {
      "verdict": "true",
      "explanation": "AI explanation with links https://example.com",
      "confidence_score": 0.85,
      "sources": [
        {"title": "Source 1", "url": "https://source1.com"}
      ],
      "disclaimer": "This is an AI-generated response..."
    },
    "human_verdict": {
      "verdict": "verified",
      "explanation": "Human fact-checker explanation",
      "fact_checker_id": "uuid",
      "reviewed_at": "2025-01-15T11:45:20.456Z"
    }
  }
}
```

### 4. Get Trending Claims
**Endpoint:** `GET /api/claims/trending`

**Requirements:**
- Return all submitted claims
- Sort by latest first (most recent created_at)
- Include verdict status

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim text",
      "category": "Politics",
      "status": "verified",
      "verdict": "true",
      "created_at": "2025-01-15T10:30:45.123Z",
      "images": ["url1"]
    }
  ]
}
```

---

## AI Integration

### AI Verdict Requirements

**Important:** AI verdicts must be intelligently labeled based on the actual AI response content, not default to "needs context".

The AI verdict should analyze the response and set appropriate labels:
- "true" / "verified" - when AI confirms the claim is accurate
- "false" - when AI determines the claim is incorrect
- "misleading" - when claim contains partial truths or misleading information
- "needs_context" - only when AI explicitly states more context is needed

**AI Response Format:**
```json
{
  "verdict": "true",
  "explanation": "Detailed explanation with sources. Links: https://source1.com https://source2.com",
  "confidence_score": 0.85,
  "sources": [
    {"title": "Source Title", "url": "https://source.com"}
  ],
  "disclaimer": "This is an AI-generated response. Please verify with official sources."
}
```

---

## Fact-Checker Endpoints

### 1. Get Pending Claims
**Endpoint:** `GET /api/fact-checker/claims/pending`

**Requirements:**
- Return claims with 'pending' status
- Include attached images
- Include AI verdict if available

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim text",
      "description": "Full description",
      "category": "Politics",
      "created_at": "2025-01-15T10:30:45.123Z",
      "images": ["url1", "url2"],
      "ai_verdict": {...}
    }
  ]
}
```

### 2. Submit Verdict
**Endpoint:** `POST /api/fact-checker/claims/:claimId/verdict`

**Requirements:**
- Store verdict with timestamp
- Mark claim as reviewed
- Create notification for user
- Award points to fact-checker

**Request Body:**
```json
{
  "verdict": "verified",
  "explanation": "Detailed fact-check explanation",
  "sources": [
    {"title": "Source 1", "url": "https://source1.com"}
  ]
}
```

### 3. Get Fact-Checker's Claims
**Endpoint:** `GET /api/fact-checker/my-claims`

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim text",
      "verdict": "verified",
      "reviewed_at": "2025-01-15T11:45:20.456Z"
    }
  ]
}
```

---

## Admin Endpoints

### 1. Dashboard Stats
**Endpoint:** `GET /api/admin/dashboard/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_users": 150,
    "total_claims": 450,
    "pending_claims": 23,
    "verified_false_claims": 45,
    "active_fact_checkers": 12,
    "pending_registrations": 5,
    "total_blogs": 30,
    "total_admins": 3
  }
}
```

### 2. Get All Users
**Endpoint:** `GET /api/admin/users`

**Requirements:**
- Include phone numbers
- Include countries
- Include points
- Include status (active/suspended)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "username": "johndoe",
      "email": "user@example.com",
      "phone": "+254700000000",
      "country": "Kenya",
      "role": "user",
      "status": "active",
      "total_points": 150,
      "created_at": "2025-01-15T10:00:00Z",
      "last_login": "2025-01-20T14:30:00Z"
    }
  ]
}
```

### 3. Get Fact-Checkers
**Endpoint:** `GET /api/admin/fact-checkers`

**Requirements:**
- Include number of claims worked on
- Include verdicts count

**Response:**
```json
{
  "success": true,
  "fact_checkers": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "email": "fc@example.com",
      "username": "factchecker1",
      "phone": "+254711111111",
      "status": "active",
      "total_verdicts": 45,
      "verdicts_count": 45,
      "created_at": "2025-01-10T10:00:00Z"
    }
  ]
}
```

### 4. Get Fact-Checker Claims
**Endpoint:** `GET /api/admin/fact-checkers/:userId/claims`

**Requirements:**
- Return all claims worked on by specific fact-checker
- Include the verdict provided
- Include images if any

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim text",
      "category": "Politics",
      "verdict": "verified",
      "explanation": "Fact-checker's explanation",
      "reviewed_at": "2025-01-15T11:45:20.456Z",
      "images": ["url1", "url2"],
      "sources": [
        {"title": "Source", "url": "https://source.com"}
      ]
    }
  ]
}
```

### 5. User Actions
**Endpoint:** `POST /api/admin/users/:userId/actions`

**Requirements:**
- Support suspend/activate/approve actions
- When user is suspended, block their login
- Store suspension reason

**Request Body:**
```json
{
  "action": "suspend",
  "reason": "Violation of terms"
}
```

### 6. Register Fact-Checker/Admin
**Endpoint:** `POST /api/admin/users/register-fact-checker`
**Endpoint:** `POST /api/admin/users/register-admin`

**Request Body:**
```json
{
  "email": "new@example.com",
  "username": "uniqueusername",
  "password": "password123",
  "phone": "+254700000000",
  "areasOfExpertise": ["Politics", "Health"]
}
```

---

## Verdict Response System

### 1. Submit User Response
**Endpoint:** `POST /api/claims/:claimId/verdict-response`

**Requirements:**
- Store user's response to verdict
- Make visible to fact-checkers and admins

**Request Body:**
```json
{
  "response": "User's feedback on the verdict"
}
```

### 2. Get Verdict Responses
**Endpoint:** `GET /api/claims/:claimId/verdict-responses`

**Response:**
```json
{
  "success": true,
  "responses": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "username": "johndoe",
      "response": "User's feedback",
      "created_at": "2025-01-15T12:00:00Z"
    }
  ]
}
```

---

## Notifications

### 1. Get Unread Verdict Count
**Endpoint:** `GET /api/notifications/unread-verdicts`

**Requirements:**
- Count claims where verdict was provided but user hasn't viewed
- Track when user opens claim details
- Reset count after viewing

**Response:**
```json
{
  "success": true,
  "count": 3
}
```

### 2. Mark Verdict as Read
**Endpoint:** `POST /api/claims/:claimId/mark-read`

**Requirements:**
- Mark verdict as read when user views claim details
- Update timestamp

---

## Points System

### Points Awards
- Submit claim: +10 points
- Claim verified as true: +20 points
- Daily login: +5 points
- Fact-checker submits verdict: +15 points

### Requirements
- Track points per user
- Admin can view all user points
- Points displayed in profile

---

## Timestamp Requirements

**CRITICAL:** All timestamps must be stored and returned in ISO 8601 format with timezone information:
```
2025-01-15T10:30:45.123Z
```

**Fields requiring timestamps:**
- claim.created_at (when claim submitted)
- claim.updated_at (when verdict provided)
- verdict.reviewed_at (when fact-checker provided verdict)
- user.last_login
- user.created_at

**Frontend Formatting:**
The frontend will handle displaying these timestamps in user-friendly formats like:
- "Jan 15, 2025 at 2:30 PM"
- "2 hours ago"

---

## Image Handling

### Requirements
- Support multiple images per claim
- Store image URLs in database
- Return image URLs in claim responses
- Fact-checkers must be able to view images when reviewing claims

---

## Responsive Design Notes

The frontend is designed to be responsive across:
- Mobile phones (small screens)
- Tablets
- Devices with curved screens
- Various screen sizes

All layouts use flexible units and responsive containers.

---

## Testing Checklist

Before deployment, verify:
- [ ] Phone validation (9 digits, starts with 7 or 1)
- [ ] Username uniqueness (no auto-appending numbers)
- [ ] Login with username OR email works
- [ ] Suspended users cannot login
- [ ] Timestamps are correct and timezone-aware
- [ ] AI verdict labeling is intelligent (not always "needs context")
- [ ] Images display in claims for fact-checkers
- [ ] Admin can see fact-checker claims and verdicts
- [ ] User responses on verdicts are visible to fact-checkers/admins
- [ ] Unread verdict notifications work correctly
- [ ] Points system awards correctly
- [ ] Admin logout works (no auto-login loop)
