# HAKIKISHA - Comprehensive System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication System](#authentication-system)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [AI Integration](#ai-integration)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Database Schema](#database-schema)
7. [Frontend Features](#frontend-features)

---

## Overview

HAKIKISHA is a fact-checking platform that allows users to submit claims, fact-checkers to verify them (with AI assistance), and administrators to manage the entire system. The platform features real-time AI fact-checking using Poe AI's Web-Search model, role-based access control, and a comprehensive admin dashboard.

### Key Features
- **AI-Powered Fact Checking**: Automatic claim verification using Poe AI
- **Role-Based System**: Users, Fact Checkers, and Administrators
- **Points & Gamification**: User engagement tracking
- **Blog Platform**: Fact-checkers can publish educational content
- **Mobile-First**: React Native application
- **Dark Mode Support**: User preference for light/dark themes

---

## Authentication System

### Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Supports**: Email OR Username login
- **Request Body**:
```json
{
  "identifier": "user@example.com OR username",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "user|fact_checker|admin",
    "status": "active|suspended"
  }
}
```
- **Important**: Suspended users should receive 401/403 and be prevented from logging in

### Registration
- **User Registration**: `POST /api/v1/auth/register`
- **Fact Checker Registration**: `POST /api/v1/admin/users/register-fact-checker`
- **Admin Registration**: `POST /api/v1/admin/users/register-admin`

**Registration Fields** (User & Fact Checker):
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "phone": "+254700000000",
  "country": "Kenya",
  "credentials": "Journalism degree, 5 years experience",
  "areasOfExpertise": ["Politics", "Health"]
}
```

### Password Reset
- **Forgot Password**: `POST /api/v1/auth/forgot-password`
- **Reset Password**: `POST /api/v1/auth/reset-password`

---

## Backend API Endpoints

### Claims Management

#### Submit Claim
```
POST /api/v1/claims
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Claim title",
  "description": "Detailed claim description",
  "category": "politics|health|business|education",
  "source_link": "https://source.com",
  "media_url": "https://image.com/pic.jpg",
  "media_type": "image|video|link"
}
```

**Response** (Auto-AI Analysis):
```json
{
  "success": true,
  "claim": {
    "id": "uuid",
    "title": "...",
    "status": "pending",
    "ai_verdict": {
      "verdict": "true|false|misleading|needs_context",
      "explanation": "AI analysis explanation",
      "confidence": 0.85,
      "sources": ["source1.com", "source2.com"],
      "disclaimer": "This is an AI-generated response..."
    }
  }
}
```

#### Get Claims
```
GET /api/v1/claims?status=pending&category=politics
Authorization: Bearer {token}
```

#### Get Claim Details
```
GET /api/v1/claims/:claimId
Authorization: Bearer {token}
```

### Fact Checker Endpoints

#### Get Pending Claims
```
GET /api/v1/fact-checker/pending-claims
Authorization: Bearer {token}

Response includes ai_disclaimer and ai_edited fields
```

#### Get AI Suggestions
```
GET /api/v1/fact-checker/ai-suggestions
Authorization: Bearer {token}
```

#### Submit Verdict
```
POST /api/v1/fact-checker/verdicts
Authorization: Bearer {token}

{
  "claim_id": "uuid",
  "verdict": "true|false|misleading|needs_context",
  "explanation": "Detailed fact-check explanation",
  "sources": ["source1.com", "source2.com"],
  "ai_verdict_id": "uuid (optional - if editing AI verdict)",
  "time_spent": 300
}
```

**Important**: If `ai_verdict_id` is provided:
- Mark AI verdict as `is_edited_by_human: true`
- Set `edited_by_fact_checker_id` and `edited_at`
- Set verdict `responsibility: 'creco'` (CRECO is responsible when human edits)
- If no AI verdict edited, set `responsibility: 'ai'`

#### Approve/Edit AI Verdict
```
POST /api/v1/fact-checker/ai-verdicts/:verdictId/approve
Authorization: Bearer {token}

{
  "verdict": "true|false|misleading|needs_context",
  "explanation": "Modified explanation (optional)",
  "sources": ["source1.com"],
  "edited": true
}
```

#### Get Fact Checker Stats
```
GET /api/v1/fact-checker/stats
Authorization: Bearer {token}
```

#### Get Fact Checker Claims (for specific fact checker)
```
GET /api/v1/admin/fact-checkers/:userId/claims
Authorization: Bearer {admin_token}

Returns all claims worked on by specific fact checker
```

### Blog Endpoints

#### Create Blog
```
POST /api/v1/blogs
Authorization: Bearer {fact_checker_token}

{
  "title": "Blog title",
  "category": "Governance|Health|Politics",
  "content": "Blog content in markdown",
  "status": "published"
}
```

#### Get Blogs
```
GET /api/v1/blogs
GET /api/v1/blogs/:blogId
```

### User Profile Endpoints

#### Get Profile
```
GET /api/v1/user/profile
Authorization: Bearer {token}

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "phone_number": "+254700000000",
  "country": "Kenya",
  "role": "user",
  "points": 150,
  "profile_picture": "url",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update Profile
```
PUT /api/v1/user/profile
Authorization: Bearer {token}

{
  "full_name": "Updated Name",
  "phone_number": "+254700000001",
  "country": "Updated Country"
}
```

**Important**: Phone and country must be returned in GET and update properly in PUT

#### Upload Profile Picture
```
POST /api/v1/user/profile-picture
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- image: (file)
```

#### Change Password
```
POST /api/v1/user/change-password
Authorization: Bearer {token}

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Admin Endpoints

#### Dashboard Stats
```
GET /api/v1/admin/dashboard/stats
Authorization: Bearer {admin_token}

Response:
{
  "stats": {
    "total_users": 1000,
    "total_claims": 500,
    "pending_claims": 50,
    "verified_false_claims": 100,
    "active_fact_checkers": 20,
    "pending_registrations": 5,
    "total_blogs": 50,
    "total_admins": 3
  }
}
```

#### Get All Users
```
GET /api/v1/admin/users?role=user&status=active&page=1&limit=50
Authorization: Bearer {admin_token}

Response must include: phone, country, points (remove streaks)
```

#### Get All Fact Checkers
```
GET /api/v1/admin/fact-checkers?status=approved
Authorization: Bearer {admin_token}

Response must include:
- phone
- total_verdicts (count of verdicts)
- Claims worked on via: GET /api/v1/admin/fact-checkers/:userId/claims
```

#### User Actions
```
POST /api/v1/admin/users/:userId/actions
Authorization: Bearer {admin_token}

{
  "action": "suspend|activate|approve",
  "reason": "Violation of terms"
}
```

#### Reset Password (Admin)
```
POST /api/v1/admin/users/:userId/reset-password
POST /api/v1/admin/fact-checkers/:userId/reset-password
POST /api/v1/admin/admins/:userId/reset-password

{
  "newPassword": "new_password123"
}
```

---

## AI Integration

### Poe AI Configuration
```javascript
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: "ZceEiyLZg4JbvhV8UDpnY0rMT037Pi4QIhdPy4pirRA",
  baseURL: "https://api.poe.com/v1",
});

const response = await openai.chat.completions.create({
  model: "Web-Search",
  messages: [{ role: "user", content: prompt }],
});
```

### Automatic AI Fact-Checking Flow
1. User submits claim → `POST /api/v1/claims`
2. Backend automatically calls Poe AI for fact-check
3. AI verdict saved to `ai_verdicts` table with disclaimer:
   ```
   "This is an AI-generated response. CRECO is not responsible for any implications. 
   Please verify the information independently."
   ```
4. Claim returned with `ai_verdict` attached
5. Fact checker can review and either:
   - Approve as-is (`responsibility: 'ai'`)
   - Edit verdict (`responsibility: 'creco'`, `is_edited_by_human: true`)

### Database Schema for AI Verdicts

```sql
CREATE TABLE ai_verdicts (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  verdict TEXT, -- 'true', 'false', 'misleading', 'needs_context'
  explanation TEXT,
  confidence DECIMAL,
  sources TEXT[],
  disclaimer TEXT,
  is_edited_by_human BOOLEAN DEFAULT FALSE,
  edited_by_fact_checker_id UUID,
  edited_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE verdicts (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  fact_checker_id UUID REFERENCES users(id),
  verdict TEXT,
  explanation TEXT,
  sources TEXT[],
  based_on_ai_verdict BOOLEAN DEFAULT FALSE,
  responsibility TEXT, -- 'ai' or 'creco'
  time_spent INTEGER,
  created_at TIMESTAMP
);
```

---

## User Roles & Permissions

### User (Regular)
- Submit claims
- View verified claims
- Read blogs
- Earn points for engagement
- **No access to**: Admin dashboard, fact-checking tools

### Fact Checker
- All user permissions
- View pending claims with AI suggestions
- Submit verdicts
- Edit/approve AI verdicts
- Publish blogs
- View fact-checker dashboard
- **Must have status**: `active` (suspended fact checkers cannot login)

### Admin
- All permissions
- Manage users (suspend, activate, delete)
- Manage fact checkers (view claims they worked on, suspend)
- View system statistics
- Register new fact checkers and admins
- **Cannot** submit regular claims

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  username VARCHAR UNIQUE,
  password_hash VARCHAR,
  full_name VARCHAR,
  phone_number VARCHAR,
  country VARCHAR,
  role VARCHAR, -- 'user', 'fact_checker', 'admin'
  status VARCHAR, -- 'active', 'suspended', 'inactive'
  registration_status VARCHAR, -- 'pending', 'approved', 'rejected'
  is_verified BOOLEAN,
  profile_picture TEXT,
  points INTEGER DEFAULT 0,
  -- REMOVED: current_streak, longest_streak, last_activity_date
  created_at TIMESTAMP,
  last_login TIMESTAMP
);
```

### Claims Table
```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR,
  description TEXT,
  category VARCHAR,
  source_link TEXT,
  media_url TEXT,
  media_type VARCHAR,
  status VARCHAR, -- 'pending', 'verified', 'false', 'misleading'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Fact Checkers Table
```sql
CREATE TABLE fact_checkers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  credentials TEXT,
  areas_of_expertise TEXT[],
  verification_status VARCHAR,
  is_active BOOLEAN,
  is_featured BOOLEAN,
  created_at TIMESTAMP
);
```

---

## Frontend Features

### Dark Mode
- Toggle available in Profile screen
- Persisted using ThemeContext
- All screens support dark mode with proper contrast

### Profile Features
- View/edit personal information
- Upload profile picture
- Change password
- View points (streaks removed)
- Dark mode toggle
- Logout button

### Admin Dashboard
- Professional header design
- Dropdown settings menu (not icon)
- Logout functionality
- View all users with phone numbers
- Manage fact checkers
  - View total verdicts count
  - View list of claims worked on
  - View specific claim responses
- Suspend functionality prevents login

### Fact Checker Dashboard
- View pending claims with AI suggestions
- Edit AI verdicts (marks as CRECO responsible)
- Approve AI verdicts as-is (marks as AI responsible)
- Publish blogs
- View statistics
- Logout button in profile

### Bottom Navigation Tabs
- Reduced height (56px)
- Better icon sizing
- No "AI" label (just icon, slightly larger)

---

## Required Backend Implementations

### Critical Missing Features
1. **Phone & Country Fields**: Must be stored and returned in user profiles
2. **Suspend Login Check**: Suspended users must be blocked at login
3. **Fact Checker Claims Endpoint**: `/api/v1/admin/fact-checkers/:userId/claims`
4. **Verdicts Count**: Add count to fact checker responses
5. **Profile Update**: Must save phone and country fields
6. **Streak Removal**: Remove all streak-related fields from responses

### API Performance Requirements
- Response time < 2 seconds for all endpoints
- Proper indexing on users.email, users.username, claims.status
- Pagination support for large datasets
- Caching for dashboard stats (5 min TTL)

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `AUTH_FAILED`: Invalid credentials
- `ACCOUNT_SUSPENDED`: User is suspended
- `UNAUTHORIZED`: Missing/invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data

---

## Security Considerations

1. **JWT Tokens**: Use secure, HttpOnly tokens where possible
2. **Password Hashing**: Use bcrypt with salt rounds ≥ 10
3. **Rate Limiting**: Implement on login, registration, and AI endpoints
4. **Input Validation**: Sanitize all user inputs
5. **SQL Injection Prevention**: Use parameterized queries
6. **XSS Protection**: Escape all user-generated content
7. **CORS**: Configure properly for mobile app

---

## Deployment Checklist

- [ ] Environment variables configured (POE_API_KEY, JWT_SECRET, DATABASE_URL)
- [ ] Database migrations applied
- [ ] CORS configured for mobile app
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error monitoring (Sentry, etc.)
- [ ] Backup strategy implemented
- [ ] SSL/TLS certificates valid
- [ ] Health check endpoint: `GET /api/v1/health`

---

**Last Updated**: 2025-01-05
**Version**: 2.0.0
**Maintained By**: HAKIKISHA Development Team
