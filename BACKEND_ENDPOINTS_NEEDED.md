# Backend Endpoints Needed for Full Functionality

This document lists the backend endpoints and features that need to be implemented to support all the mobile app functionality.

## 1. Verified Claims Endpoint (PUBLIC)
**Endpoint:** `GET /api/v1/claims/verified`
**Purpose:** Fetch all claims that have been verified by fact-checkers (regardless of user)
**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "claim_id",
      "title": "Claim title",
      "description": "Claim description",
      "category": "governance",
      "status": "verified|false|misleading|needs_context",
      "verdict": "true|false|misleading|needs_context",
      "verdictText": "Detailed verdict explanation",
      "human_explanation": "Human fact-checker explanation",
      "submittedDate": "2024-01-15T10:30:00Z",
      "verdictDate": "2024-01-16T14:20:00Z",
      "verified_by_ai": false,
      "ai_verdict": null,
      "fact_checker": {
        "id": "fc_id",
        "name": "John Doe"
      },
      "sources": [
        {
          "url": "https://source.com",
          "title": "Source Title"
        }
      ]
    }
  ]
}
```

## 2. AI Verification System
**Time Window:** 7pm to 7am (outside working hours)
**Endpoints:**

### Submit Claim with AI Processing
**Endpoint:** `POST /api/v1/claims`
**Enhancement:** Add AI processing logic
- If submitted between 7pm-7am, trigger AI verification
- AI should analyze claim and return verdict
- Mark verdict as `verified_by_ai: true`
- Send notification to user with AI verdict
- Add disclaimer that human verification will follow during working hours

### AI Verdict Review (Fact-Checker)
**Endpoint:** `GET /api/v1/fact-checker/ai-verdicts`
**Purpose:** Fetch all AI-generated verdicts for human review
**Response:**
```json
{
  "success": true,
  "ai_verdicts": [
    {
      "id": "claim_id",
      "title": "Claim title",
      "ai_verdict": "false",
      "ai_explanation": "AI's reasoning",
      "ai_sources": [...],
      "submitted_at": "2024-01-15T20:30:00Z",
      "needs_human_review": true
    }
  ]
}
```

### Update AI Verdict (Fact-Checker)
**Endpoint:** `PUT /api/v1/fact-checker/claims/:id/edit-ai-verdict`
**Purpose:** Allow fact-checkers to edit/confirm AI verdicts
**Request Body:**
```json
{
  "verdict": "verified|false|misleading|needs_context",
  "human_explanation": "Human fact-checker's explanation",
  "sources": [...],
  "override_ai": true
}
```

## 3. Push Notifications
**Service:** Implement push notification service (Firebase Cloud Messaging or similar)

### Notification Types:
1. **Claim Submitted:** "Your claim has been received and will be reviewed."
2. **AI Verdict Available:** "AI has analyzed your claim. Human verification will follow during working hours."
3. **Claim Verified:** "Your claim has been verified by our fact-checkers."
4. **Claim Status Updated:** "The status of your claim has been updated."

**Endpoints:**

### Register Device Token
**Endpoint:** `POST /api/v1/user/device-token`
**Request Body:**
```json
{
  "device_token": "fcm_token_here",
  "platform": "ios|android"
}
```

### Send Notification (Backend Triggered)
Implement backend service to send notifications when:
- Claim is submitted
- AI provides verdict
- Fact-checker updates verdict
- Claim status changes

## 4. Image Upload for Claims
**Endpoint:** `POST /api/v1/claims/upload-evidence`
**Purpose:** Upload image evidence for claims
**Request:** Multipart form data with image file
**Response:**
```json
{
  "success": true,
  "imageUrl": "https://storage.url/evidence/image.jpg"
}
```

## 5. Social Sharing Deep Links
**Setup:** Configure deep linking in backend
- App scheme: `hakikisha://`
- Universal Links for iOS: `https://hakikisha.app/blog/:id`
- App Links for Android: `https://hakikisha.app/blog/:id`

**Endpoint:** `GET /blogs/share/:id`
**Purpose:** Serve blog preview for social sharing with proper meta tags

## 6. Performance Optimizations

### Pagination
Add pagination to all list endpoints:
```
GET /api/v1/claims/verified?page=1&limit=20
GET /api/v1/claims/my-claims?page=1&limit=20
GET /api/v1/blogs?page=1&limit=20
```

### Caching
- Implement Redis caching for frequently accessed data
- Cache verified claims for 5 minutes
- Cache blogs for 15 minutes

### Database Indexing
Ensure proper indexes on:
- `claims.status`
- `claims.verdictDate`
- `claims.submitted_at`
- `claims.verified_by_ai`

## 7. Error Response Standardization
All error responses should be user-friendly:

```json
{
  "success": false,
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": {} // Only in development mode
}
```

## Implementation Priority

**High Priority:**
1. AI Verification System (7pm-7am)
2. Verified Claims Public Endpoint
3. Push Notifications

**Medium Priority:**
4. Image Upload for Claims
5. AI Verdict Review for Fact-Checkers
6. Performance Optimizations

**Low Priority:**
7. Social Sharing Deep Links

## Testing Checklist

- [ ] AI verification triggers correctly between 7pm-7am
- [ ] Users receive notifications for claim updates
- [ ] Fact-checkers can see and edit AI verdicts
- [ ] Image upload works for claim evidence
- [ ] All verified claims visible to all users
- [ ] Deep links redirect to app/store correctly
- [ ] Error messages are user-friendly
- [ ] Pagination works on all endpoints
- [ ] Performance is optimized with caching
