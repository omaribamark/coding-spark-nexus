# CRECO Fact-Checking Platform - API Documentation

## Overview
This document provides comprehensive API documentation for the CRECO fact-checking platform, including all endpoints related to claim submission, fact-checking workflows, blog management, and media handling.

---

## Table of Contents
1. [Authentication](#authentication)
2. [Claims API](#claims-api)
3. [Fact Checker API](#fact-checker-api)
4. [Blog Management API](#blog-management-api)
5. [Media Upload Guidelines](#media-upload-guidelines)
6. [Response Formats](#response-formats)
7. [Error Handling](#error-handling)

---

## Authentication part

All protected endpoints require authentication using JWT tokens.

### Headers
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## Claims API

### 1. Submit a Claim

**Endpoint:** `POST /api/claims`

**Authentication:** Required

**Description:** Submit a new claim for fact-checking. Claims with images or videos are automatically routed to human fact-checkers. Text-only claims are processed by AI first.

**Request Body:**
```json
{
  "category": "politics|health|education|technology|business|other",
  "claimText": "The claim text to be verified (required)",
  "videoLink": "https://example.com/video.mp4 (optional)",
  "sourceLink": "https://example.com/source (optional)",
  "imageUrl": "https://example.com/image.jpg (optional)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "claim": {
    "id": "uuid",
    "title": "Claim title",
    "category": "politics",
    "status": "pending|human_review",
    "submittedDate": "2024-01-01T00:00:00.000Z",
    "videoUrl": "https://example.com/video.mp4",
    "sourceUrl": "https://example.com/source"
  },
  "pointsAwarded": 5,
  "isFirstClaim": false,
  "requiresHumanReview": true,
  "reviewMessage": "Your claim includes media content (images/videos) and will be thoroughly reviewed by our expert fact-checkers to ensure accurate verification of visual evidence."
}
```

**Important Notes:**
- **Claims with images or videos** bypass AI processing and go directly to human fact-checkers
- **Text-only claims** are processed by AI first
- Users receive appropriate notifications based on the review type
- Maximum file size for images: 10MB

---

### 2. Get My Claims

**Endpoint:** `GET /api/claims/my-claims`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (`all`, `pending`, `completed`, `human_review`)

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim title",
      "category": "politics",
      "status": "completed",
      "submittedDate": "2024-01-01T00:00:00.000Z",
      "verdictDate": "2024-01-02T00:00:00.000Z",
      "verdict": "true|false|misleading|needs_context",
      "verdictText": "Detailed explanation",
      "sources": ["https://source1.com", "https://source2.com"],
      "factCheckerName": "Fact Checker Name",
      "videoUrl": "https://example.com/video.mp4",
      "sourceUrl": "https://example.com/source",
      "imageUrl": "https://example.com/image.jpg",
      "mediaType": "image|video|text"
    }
  ]
}
```

---

### 3. Get Claim Details

**Endpoint:** `GET /api/claims/:claimId`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "claim": {
    "id": "uuid",
    "title": "Claim title",
    "description": "Full claim description",
    "category": "politics",
    "status": "completed",
    "submittedBy": "user@example.com",
    "submittedDate": "2024-01-01T00:00:00.000Z",
    "verdict": "true",
    "verdictText": "Detailed explanation",
    "sources": ["https://source1.com"],
    "factCheckerEmail": "checker@example.com",
    "mediaUrl": "https://example.com/media.jpg",
    "videoUrl": "https://example.com/video.mp4",
    "sourceUrl": "https://example.com/source",
    "ai_verdict": {
      "id": "uuid",
      "verdict": "true",
      "explanation": "AI explanation",
      "confidence_score": 0.9,
      "sources": [],
      "disclaimer": "AI disclaimer",
      "is_edited_by_human": false
    }
  }
}
```

---

### 4. Get Trending Claims

**Endpoint:** `GET /api/claims/trending`

**Authentication:** Not required (public)

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Trending claim",
      "category": "politics",
      "status": "completed",
      "verdict": "false",
      "trendingScore": 95.5,
      "submittedDate": "2024-01-01T00:00:00.000Z",
      "verdictDate": "2024-01-02T00:00:00.000Z",
      "verified_by_ai": false,
      "videoUrl": "https://example.com/video.mp4",
      "sourceUrl": "https://example.com/source"
    }
  ]
}
```

---

### 5. Search Claims

**Endpoint:** `GET /api/claims/search`

**Authentication:** Not required (public)

**Query Parameters:**
- `q` (required): Search query text
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim matching search",
      "category": "health",
      "status": "completed",
      "verdict": "misleading"
    }
  ]
}
```

---

### 6. Upload Evidence

**Endpoint:** `POST /api/claims/upload-evidence`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request:**
```
FormData:
  evidence: <file> (Max 10MB)
```

**Response:**
```json
{
  "success": true,
  "fileUrl": "/uploads/evidence/uuid-filename.jpg"
}
```

---

## Fact Checker API

### 1. Get Pending Claims

**Endpoint:** `GET /api/fact-checker/pending-claims`

**Authentication:** Required (Fact Checker role)

**Description:** Get all claims awaiting review, including those with images and videos.

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": "uuid",
      "title": "Claim title",
      "description": "Full claim description",
      "category": "politics",
      "submittedBy": "user@example.com",
      "submittedDate": "2024-01-01T00:00:00.000Z",
      "imageUrl": "https://example.com/image.jpg",
      "videoLink": "https://example.com/video.mp4",
      "sourceLink": "https://example.com/source",
      "videoUrl": "https://example.com/video.mp4",
      "sourceUrl": "https://example.com/source",
      "ai_suggestion": {
        "verdict": "false",
        "explanation": "AI explanation",
        "confidence": 0.85,
        "sources": [],
        "disclaimer": "AI disclaimer",
        "isEdited": false
      }
    }
  ]
}
```

**Important Notes:**
- **imageUrl, videoUrl, and sourceUrl** are available for all claims
- Fact checkers can view and verify media content before submitting verdicts
- Claims with media bypass AI processing and require human verification

---

### 2. Submit Verdict

**Endpoint:** `POST /api/fact-checker/submit-verdict`

**Authentication:** Required (Fact Checker role)

**Request Body:**
```json
{
  "claimId": "uuid",
  "verdict": "true|false|misleading|needs_context|unverifiable",
  "explanation": "Detailed explanation of the verdict",
  "sources": [
    "https://source1.com",
    "https://source2.com"
  ],
  "time_spent": 300
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verdict submitted successfully",
  "verdictId": "uuid"
}
```

---

### 3. Get AI Verdicts for Review

**Endpoint:** `GET /api/fact-checker/ai-verdicts`

**Authentication:** Required (Fact Checker role)

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page
- `status` (optional): Filter by edit status (`all`, `edited`, `unedited`)

**Response:**
```json
{
  "success": true,
  "ai_verdicts": [
    {
      "claim_id": "uuid",
      "claim_title": "Claim title",
      "claim_description": "Description",
      "claim_category": "politics",
      "claim_status": "completed",
      "claim_date": "2024-01-01T00:00:00.000Z",
      "submitted_by": "user@example.com",
      "ai_verdict": {
        "id": "uuid",
        "verdict": "false",
        "explanation": "AI explanation",
        "confidence": 0.9,
        "sources": [],
        "disclaimer": "AI disclaimer",
        "is_edited": false,
        "edited_by": null,
        "edited_by_name": null,
        "edited_date": null
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

### 4. Edit AI Verdict

**Endpoint:** `PUT /api/fact-checker/ai-verdicts/:claimId`

**Authentication:** Required (Fact Checker role)

**Request Body:**
```json
{
  "verdict": "true|false|misleading|needs_context|unverifiable",
  "explanation": "Updated explanation",
  "confidence_score": 0.95,
  "evidence_sources": [
    "https://source1.com",
    "https://source2.com"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI verdict edited successfully",
  "ai_verdict": {
    "id": "uuid",
    "verdict": "false",
    "explanation": "Updated explanation",
    "confidence_score": 0.95,
    "is_edited_by_human": true,
    "edited_by_fact_checker_id": "uuid"
  }
}
```

---

### 5. Get Fact Checker Stats

**Endpoint:** `GET /api/fact-checker/stats`

**Authentication:** Required (Fact Checker role)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalVerified": 45,
    "pendingReview": 12,
    "timeSpent": "15 minutes avg",
    "accuracy": "92%"
  }
}
```

---

## Blog Management API

### 1. Create Blog

**Endpoint:** `POST /api/blogs`

**Authentication:** Required (Fact Checker role)

**Description:** Create a new blog post with optional featured image and video URL.

**Request Body:**
```json
{
  "title": "Blog post title (required)",
  "content": "Full blog content in markdown (required)",
  "category": "fact_check|news|analysis|education",
  "tags": ["tag1", "tag2"],
  "featured_image": "https://example.com/image.jpg (optional)",
  "video_url": "https://youtube.com/watch?v=xyz (optional)",
  "status": "draft|published"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Blog post title",
    "content": "Blog content",
    "category": "fact_check",
    "featured_image": "https://example.com/image.jpg",
    "video_url": "https://youtube.com/watch?v=xyz",
    "author_id": "uuid",
    "author_type": "human",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Blog created successfully"
}
```

**Frontend Implementation Example:**
```javascript
// Blog creation form submission
const createBlog = async (blogData) => {
  const response = await fetch('/api/blogs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: blogData.title,
      content: blogData.content,
      category: blogData.category,
      tags: blogData.tags,
      featured_image: blogData.featuredImage, // URL from image upload
      video_url: blogData.videoUrl, // YouTube, Vimeo, or other video URL
      status: 'draft' // or 'published'
    })
  });
  
  return await response.json();
};
```

---

### 2. Update Blog

**Endpoint:** `PUT /api/blogs/:id`

**Authentication:** Required (Owner or Admin)

**Request Body:**
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "featured_image": "https://example.com/new-image.jpg",
  "video_url": "https://youtube.com/watch?v=new"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated title",
    "featured_image": "https://example.com/new-image.jpg",
    "video_url": "https://youtube.com/watch?v=new"
  },
  "message": "Blog updated successfully"
}
```

---

### 3. Get All Blogs

**Endpoint:** `GET /api/blogs`

**Authentication:** Not required (public)

**Query Parameters:**
- `category` (optional): Filter by category
- `limit` (optional, default: 10): Number of items
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Blog title",
      "content": "Content preview...",
      "category": "fact_check",
      "featured_image": "https://example.com/image.jpg",
      "video_url": "https://youtube.com/watch?v=xyz",
      "author_name": "Author Name",
      "view_count": 150,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 25
  }
}
```

---

### 4. Get Single Blog

**Endpoint:** `GET /api/blogs/:id`

**Authentication:** Not required (public)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Blog title",
    "content": "Full blog content",
    "category": "fact_check",
    "featured_image": "https://example.com/image.jpg",
    "video_url": "https://youtube.com/watch?v=xyz",
    "author_id": "uuid",
    "author_name": "Author Name",
    "view_count": 151,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### 5. Publish Blog

**Endpoint:** `POST /api/blogs/:id/publish`

**Authentication:** Required (Owner or Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "published",
    "published_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Blog published successfully"
}
```

---

### 6. Delete Blog

**Endpoint:** `DELETE /api/blogs/:id`

**Authentication:** Required (Owner or Admin)

**Response:**
```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

---

## Media Upload Guidelines

### Image Upload for Claims

1. **During claim submission:**
   - Include `imageUrl` in the request body
   - The image URL should be a valid, accessible URL
   - Maximum file size: 10MB
   - Supported formats: JPG, PNG, GIF, WEBP

2. **Alternative: Upload evidence separately:**
   ```javascript
   const formData = new FormData();
   formData.append('evidence', imageFile);
   
   const uploadResponse = await fetch('/api/claims/upload-evidence', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`
     },
     body: formData
   });
   
   const { fileUrl } = await uploadResponse.json();
   // Use fileUrl as imageUrl in claim submission
   ```

### Featured Images for Blogs

1. **Upload image to your storage service** (e.g., AWS S3, Cloudinary)
2. **Get the public URL** of the uploaded image
3. **Include the URL** in the `featured_image` field when creating/updating blog

**Example Frontend Code:**
```javascript
// Step 1: Upload image
const uploadFeaturedImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  // Upload to your storage service
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData
  });
  
  const { url } = await response.json();
  return url;
};

// Step 2: Create blog with featured image
const createBlogWithImage = async (blogData, imageFile) => {
  // Upload featured image first
  const featuredImageUrl = await uploadFeaturedImage(imageFile);
  
  // Create blog with featured image URL
  const response = await fetch('/api/blogs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...blogData,
      featured_image: featuredImageUrl
    })
  });
  
  return await response.json();
};
```

### Video URLs for Blogs

- **Supported platforms:** YouTube, Vimeo, or any public video URL
- **Format:** Provide the full URL (e.g., `https://youtube.com/watch?v=xyz`)
- **Embedding:** The frontend should handle embedding based on the URL format

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

---

## Error Handling

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `AUTH_ERROR` | Authentication required/failed | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `DUPLICATE_CLAIM` | Claim already exists | 409 |
| `SERVER_ERROR` | Internal server error | 500 |

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": "Category and claim text are required",
  "code": "VALIDATION_ERROR"
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_ERROR"
}
```

**Not Found:**
```json
{
  "success": false,
  "error": "Claim not found",
  "code": "NOT_FOUND"
}
```

---

## Summary of Key Features

### ✅ Implemented Features

1. **Smart Claim Routing**
   - Claims with images/videos → Human fact-checkers only
   - Text-only claims → AI processing first

2. **Media Visibility**
   - Fact checkers can view all submitted images and videos
   - Image URLs, video URLs, and source URLs are included in claim data

3. **User Notifications**
   - Users are informed when their claims require human review
   - Clear messaging about media content verification process

4. **Blog Management**
   - Featured images and video URLs supported
   - Full CRUD operations for blogs
   - Draft and published status management

5. **Evidence Upload**
   - Separate endpoint for uploading evidence files
   - Maximum 10MB file size limit
   - Secure file handling with unique IDs

---

## Need Help?

For additional support or questions:
- Check the API endpoint status: `GET /api/health`
- Review server logs for detailed error information
- Contact the development team for integration assistance

---

**Last Updated:** 2024
**API Version:** 1.0
