# HAKIKISHA Backend API Documentation

## Overview
This document provides comprehensive documentation for all backend endpoints required for the HAKIKISHA fact-checking platform.

## Base URL
```
https://your-api-domain.com/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
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
    "username": "johndoe",
    "full_name": "John Doe",
    "role": "user",
    "phone_number": "+254700000000",
    "country": "Kenya"
  },
  "token": "jwt_token_here"
}
```

**Status Codes:**
- 201: Successfully created
- 400: Validation error
- 409: Email or username already exists

---

### 1.2 Login
**POST** `/auth/login`

Login with email/username and password.

**Request Body:**
```json
{
  "identifier": "user@example.com",  // Can be email OR username
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "role": "user",
    "phone_number": "+254700000000",
    "country": "Kenya"
  },
  "token": "jwt_token_here"
}
```

**Status Codes:**
- 200: Success
- 401: Invalid credentials
- 403: Account pending approval (for fact checkers)

---

### 1.3 Reset Password
**POST** `/auth/reset-password`

Reset user password (admin only).

**Request Body:**
```json
{
  "email": "user@example.com",
  "new_password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 2. AI Endpoints

### 2.1 AI Chat
**POST** `/ai/chat`

Send a message to the AI fact-checking assistant.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "Is it true that vaccines cause autism?",
  "hasAttachments": false,
  "attachmentTypes": []
}
```

**With Attachments:**
```json
{
  "prompt": "Can you verify this claim?",
  "hasAttachments": true,
  "attachmentTypes": ["image", "file"]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on extensive scientific research...",
  "sources": [
    {
      "title": "WHO Vaccine Safety",
      "url": "https://who.int/vaccine-safety"
    }
  ],
  "confidence": 0.95
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 429: Rate limit exceeded

---

### 2.2 AI Fact Check (Instant Verdict)
**POST** `/ai/fact-check`

Get an instant AI-powered fact check verdict for a claim.

**Request Body:**
```json
{
  "claim": "The Earth is flat",
  "category": "Science",
  "context": "Additional context about the claim"
}
```

**Response:**
```json
{
  "success": true,
  "verdict": "false",
  "confidence": 0.98,
  "explanation": "The Earth is scientifically proven to be an oblate spheroid...",
  "sources": [
    {
      "title": "NASA - Earth Science",
      "url": "https://nasa.gov/earth"
    }
  ],
  "disclaimer": "This is an AI-generated response. For official verification, please wait for our fact-checkers to review."
}
```

**Verdict Types:**
- `verified`: Claim is true
- `false`: Claim is false
- `misleading`: Claim contains misleading information
- `needs_context`: Claim requires additional context
- `unverifiable`: Cannot be verified with available information

---

## 3. User Endpoints

### 3.1 Get User Profile
**GET** `/users/profile`

Get the authenticated user's profile.

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
    "profile_picture": "https://cdn.example.com/profile.jpg",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### 3.2 Update User Profile
**PUT** `/users/profile`

Update the authenticated user's profile.

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "phone_number": "+254711111111",
  "country": "Kenya",
  "profile_picture": "base64_encoded_image_or_url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

## 4. Claims Endpoints

### 4.1 Get All Claims
**GET** `/claims`

Get a list of all claims.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (verified, false, pending, etc.)
- `category` (optional): Filter by category

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
      "status": "verified",
      "submitted_by": "user_id",
      "submitted_date": "2024-01-15T10:30:00Z",
      "verified_date": "2024-01-16T14:20:00Z",
      "fact_checker": "fact_checker_id",
      "ai_verdict": {
        "verdict": "verified",
        "confidence": 0.85,
        "explanation": "Brief explanation..."
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 100
  }
}
```

---

### 4.2 Submit Claim
**POST** `/claims/submit`

Submit a new claim for verification.

**Request Body:**
```json
{
  "title": "Claim title",
  "description": "Detailed description of the claim",
  "category": "Politics",
  "sources": [
    {
      "title": "Source title",
      "url": "https://source.com"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "claim": {
    "id": "uuid",
    "title": "Claim title",
    "status": "pending",
    "submitted_date": "2024-01-15T10:30:00Z"
  },
  "ai_verdict": {
    "verdict": "pending",
    "confidence": 0.65,
    "explanation": "Initial AI analysis...",
    "disclaimer": "This is an AI-generated response. Official verification pending."
  }
}
```

---

## 5. Admin Endpoints

### 5.1 Get Dashboard Stats
**GET** `/admin/dashboard/stats`

Get overview statistics for the admin dashboard.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 1250,
    "totalClaims": 450,
    "pendingClaims": 23,
    "verifiedClaims": 380,
    "falseClaims": 47,
    "factCheckers": 15,
    "admins": 3,
    "totalBlogs": 67
  }
}
```

---

### 5.2 Register Fact Checker
**POST** `/admin/users/register-fact-checker`

Register a new fact checker (admin only).

**Request Body:**
```json
{
  "email": "checker@example.com",
  "username": "factchecker1",
  "full_name": "Jane Checker",
  "password": "securePassword123",
  "phone_number": "+254722222222",
  "country": "Kenya",
  "specialization": "Politics"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fact checker registered successfully",
  "user": {
    "id": "uuid",
    "email": "checker@example.com",
    "username": "factchecker1",
    "role": "fact_checker",
    "status": "active"
  }
}
```

---

### 5.3 Register Admin
**POST** `/admin/users/register-admin`

Register a new admin (admin only).

**Request Body:**
```json
{
  "email": "admin@example.com",
  "username": "admin1",
  "full_name": "Admin User",
  "password": "securePassword123",
  "phone_number": "+254733333333",
  "country": "Kenya"
}
```

---

### 5.4 Get All Users
**GET** `/admin/users`

Get a list of all users.

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
      "role": "user",
      "status": "active",
      "lastActive": "2024-01-20T15:30:00Z",
      "joinDate": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 5.5 User Action
**POST** `/admin/users/action`

Perform actions on users (suspend, activate, delete).

**Request Body:**
```json
{
  "userId": "uuid",
  "action": "suspend"  // or "activate" or "delete"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User suspended successfully"
}
```

---

### 5.6 Get Fact Checker Activity
**GET** `/admin/dashboard/fact-checker-activity`

Get detailed activity data for fact checkers.

**Response:**
```json
{
  "success": true,
  "activity": [
    {
      "id": "uuid",
      "username": "factchecker1",
      "email": "checker@example.com",
      "phone": "+254722222222",
      "claimsVerified": 45,
      "timeSpent": "120 hours",
      "lastActive": "2024-01-20T15:30:00Z",
      "accuracy": "95%",
      "blogsWritten": 12
    }
  ]
}
```

---

## 6. Blog Endpoints

### 6.1 Get All Blogs
**GET** `/blogs`

Get a list of all blog posts.

**Response:**
```json
{
  "success": true,
  "blogs": [
    {
      "id": "uuid",
      "title": "Blog title",
      "category": "Politics",
      "excerpt": "Brief excerpt...",
      "content": "Full content...",
      "publishedBy": "author_id",
      "publishDate": "2024-01-15T10:30:00Z",
      "views": 1250,
      "likes": 89
    }
  ]
}
```

---

## 7. File Upload Endpoints

### 7.1 Upload File
**POST** `/uploads/file`

Upload files for AI analysis (images, documents).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
FormData:
- file: <binary_file>
- type: "image" | "document"
- context: "Optional context about the file"
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "uuid",
    "url": "https://cdn.example.com/uploads/file.jpg",
    "type": "image",
    "size": 1024000,
    "uploadedAt": "2024-01-20T15:30:00Z"
  }
}
```

---

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| Authentication | 5 requests/minute |
| AI Chat | 10 requests/minute |
| General API | 60 requests/minute |
| File Upload | 5 uploads/minute |

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* additional error details */ }
  }
}
```

**Common Error Codes:**
- `AUTH_FAILED`: Authentication failed
- `UNAUTHORIZED`: Insufficient permissions
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Security Best Practices

1. **Always use HTTPS** for all API requests
2. **Store JWT tokens securely** in encrypted storage
3. **Never log sensitive data** (passwords, tokens)
4. **Validate all inputs** on both client and server
5. **Implement rate limiting** to prevent abuse
6. **Use environment variables** for API keys

---

## Implementation Guide

### Setting Up the Backend

1. **Choose a backend framework:**
   - Node.js + Express
   - Python + FastAPI
   - Ruby on Rails
   - Django

2. **Set up database:**
   - PostgreSQL (recommended)
   - MySQL
   - MongoDB

3. **Configure environment variables:**
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
POE_API_KEY=ZceEiyLZg4JbvhV8UDpnY0rMT037Pi4QIhdPy4pirRA
API_BASE_URL=https://api.poe.com/v1
```

4. **Install dependencies:**
```bash
# For Node.js
npm install express cors helmet bcrypt jsonwebtoken openai

# For Python
pip install fastapi uvicorn pydantic openai
```

5. **Implement authentication middleware**
6. **Set up database migrations**
7. **Configure CORS for mobile app**
8. **Deploy to cloud provider** (AWS, Heroku, DigitalOcean)

---

## Testing

Use tools like Postman or curl to test endpoints:

```bash
# Login example
curl -X POST https://your-api.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@example.com","password":"password123"}'

# Get user profile
curl -X GET https://your-api.com/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Support

For backend implementation support, contact: support@hakikisha.app
