# CRECO Fact-Checking Platform - Documentation

## 📚 Documentation Overview

This directory contains comprehensive documentation for the CRECO fact-checking platform, covering both backend API implementation and frontend integration guidelines.

---

## 📄 Available Documentation

### 1. [API Documentation](./API_DOCUMENTATION.md)
Complete API reference for all endpoints including:
- **Claims API**: Submit, retrieve, and manage claims with media support
- **Fact Checker API**: Review claims, submit verdicts, edit AI verdicts
- **Blog Management API**: Create and manage blog posts with featured media
- **Authentication**: JWT-based authentication system
- **Error Handling**: Comprehensive error codes and responses

**Key Features:**
- ✅ Claims with images/videos bypass AI and go to human fact-checkers
- ✅ Text-only claims processed by AI first
- ✅ Featured images and videos in blog posts
- ✅ Complete CRUD operations for all resources

---

### 2. [Frontend Implementation Guide](./FRONTEND_IMPLEMENTATION_GUIDE.md)
Detailed frontend integration examples including:
- **Claim Submission Forms**: With and without image uploads
- **Media Handling**: Image upload, preview, and validation
- **Blog Creation**: Featured image and video URL support
- **Fact Checker Dashboard**: Display claims with all media content
- **Reusable Components**: Image uploader, video embeds, etc.

**Code Examples for:**
- React/Next.js implementations
- Form handling with validation
- File upload with preview
- API integration patterns
- Error handling and user feedback

---

## 🚀 Quick Start

### For Backend Developers

1. **Review API Documentation**
   ```bash
   cat docs/API_DOCUMENTATION.md
   ```

2. **Run Database Migration**
   ```bash
   # Add featured_image and video_url to blogs table
   npm run migrate:up
   ```

3. **Test Endpoints**
   - Use Postman or curl to test API endpoints
   - Refer to example requests in API docs

### For Frontend Developers

1. **Review Frontend Guide**
   ```bash
   cat docs/FRONTEND_IMPLEMENTATION_GUIDE.md
   ```

2. **Implement Core Features**
   - Start with claim submission form
   - Add image upload functionality
   - Implement blog creation with media

3. **Test Integration**
   - Follow the testing checklist in the frontend guide
   - Ensure all media types are handled correctly

---

## 🔑 Key Implementation Details

### Media Handling for Claims

**Important Business Logic:**
- **Claims WITH images or videos** → Routed directly to human fact-checkers
- **Claims WITHOUT media** → Processed by AI first

**Why?**
Visual evidence requires human expertise to properly verify context, manipulation, and authenticity.

**User Notifications:**
Users are automatically notified when their claim requires human review:
```json
{
  "requiresHumanReview": true,
  "reviewMessage": "Your claim includes media content (images/videos) and will be thoroughly reviewed by our expert fact-checkers to ensure accurate verification of visual evidence."
}
```

### Blog Media Features

**Featured Images:**
- Upload image to storage service (AWS S3, Cloudinary, etc.)
- Get public URL
- Include URL in `featured_image` field

**Video URLs:**
- Support YouTube, Vimeo, and direct video URLs
- Frontend handles embedding based on URL format
- Store full URL in `video_url` field

### Fact Checker Access

**Fact checkers can view:**
- All claim text and metadata
- Submitted images (`imageUrl` field)
- Video links (`videoUrl` field)
- Source URLs (`sourceUrl` field)
- AI suggestions (for text-only claims)

---

## 📋 Database Schema Updates

### Recent Migration: Featured Media for Blogs

**Migration File:** `migrations/027_add_featured_media_to_blogs.js`

**Changes:**
```sql
ALTER TABLE hakikisha.blog_articles 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;
```

**To Apply:**
```bash
npm run migrate:up
```

**To Rollback:**
```bash
npm run migrate:down
```

---

## 🔐 Authentication

All protected endpoints require JWT authentication:

```javascript
headers: {
  'Authorization': 'Bearer <your-jwt-token>',
  'Content-Type': 'application/json'
}
```

**Get Token:**
1. Login via `/api/auth/login`
2. Store token in localStorage or secure cookie
3. Include in all subsequent requests

---

## 🎯 API Endpoints Summary

### Claims
- `POST /api/claims` - Submit new claim (with optional media)
- `GET /api/claims/my-claims` - Get user's claims
- `GET /api/claims/:claimId` - Get claim details
- `GET /api/claims/trending` - Get trending claims (public)
- `GET /api/claims/search` - Search claims (public)
- `POST /api/claims/upload-evidence` - Upload evidence file

### Fact Checker
- `GET /api/fact-checker/pending-claims` - Get claims for review
- `POST /api/fact-checker/submit-verdict` - Submit verdict
- `GET /api/fact-checker/ai-verdicts` - Get AI verdicts for editing
- `PUT /api/fact-checker/ai-verdicts/:claimId` - Edit AI verdict
- `GET /api/fact-checker/stats` - Get fact checker stats

### Blogs
- `POST /api/blogs` - Create blog (with optional featured_image and video_url)
- `GET /api/blogs` - Get all blogs (public)
- `GET /api/blogs/:id` - Get single blog (public)
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `POST /api/blogs/:id/publish` - Publish blog

---

## 📝 Example Workflows

### 1. Submit Claim with Image

```javascript
// 1. Upload image
const formData = new FormData();
formData.append('evidence', imageFile);

const uploadRes = await fetch('/api/claims/upload-evidence', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const { fileUrl } = await uploadRes.json();

// 2. Submit claim with image URL
const claimRes = await fetch('/api/claims', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    category: 'politics',
    claimText: 'Claim to verify',
    imageUrl: fileUrl
  })
});

const data = await claimRes.json();
// Response includes requiresHumanReview: true
```

### 2. Create Blog with Featured Image

```javascript
// 1. Upload featured image to storage
const imageUrl = await uploadToStorage(imageFile);

// 2. Create blog with featured image
const blogRes = await fetch('/api/blogs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Blog Title',
    content: 'Blog content in markdown',
    category: 'fact_check',
    featured_image: imageUrl,
    video_url: 'https://youtube.com/watch?v=xyz',
    status: 'published'
  })
});
```

### 3. Fact Checker Reviews Claim with Media

```javascript
// 1. Get pending claims (includes media URLs)
const claimsRes = await fetch('/api/fact-checker/pending-claims', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { claims } = await claimsRes.json();

// Claims include: imageUrl, videoUrl, sourceUrl

// 2. Submit verdict after reviewing media
const verdictRes = await fetch('/api/fact-checker/submit-verdict', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    claimId: claim.id,
    verdict: 'false',
    explanation: 'Detailed explanation after reviewing image evidence',
    sources: ['https://source1.com', 'https://source2.com'],
    time_spent: 600
  })
});
```

---

## 🧪 Testing

### Manual Testing Checklist

**Claims:**
- [ ] Submit text-only claim (should trigger AI processing)
- [ ] Submit claim with image (should route to human review)
- [ ] Submit claim with video URL (should route to human review)
- [ ] Submit claim with both image and video (should route to human review)
- [ ] Verify user receives correct notification message
- [ ] Check claim status updates correctly

**Blogs:**
- [ ] Create blog with featured image URL
- [ ] Create blog with uploaded featured image
- [ ] Create blog with video URL
- [ ] Update blog to add/change media
- [ ] Verify media displays correctly in blog view

**Fact Checker:**
- [ ] View pending claims with images
- [ ] Access video links from claims
- [ ] Submit verdict for media-based claim
- [ ] Edit AI verdict
- [ ] Verify stats update correctly

---

## 🐛 Troubleshooting

### Common Issues

**1. Image upload fails**
- Check file size (must be < 10MB)
- Verify file type is valid image format
- Ensure authentication token is valid
- Check server logs for specific error

**2. Claim not routing to human review**
- Verify `imageUrl` or `videoLink` is included in request
- Check claim status is set to 'human_review'
- Review server logs for routing logic

**3. Blog media not displaying**
- Ensure `featured_image` URL is publicly accessible
- Verify `video_url` is properly formatted
- Check frontend embed logic for video platforms

**4. Fact checker can't see media**
- Verify claim includes media fields in response
- Check database for `media_url`, `video_url` values
- Ensure fact checker role has proper permissions

---

## 📞 Support

For questions or issues:
1. Review documentation thoroughly
2. Check server logs for detailed errors
3. Test endpoints with Postman/curl
4. Contact development team with:
   - Error messages
   - Request/response examples
   - Expected vs actual behavior

---

## 🔄 Recent Updates

**v1.0 - Latest**
- ✅ Added automatic routing for claims with media to human fact-checkers
- ✅ Implemented user notifications for media-based claims
- ✅ Added featured_image and video_url support for blogs
- ✅ Updated fact checker dashboard to display all media content
- ✅ Created comprehensive API and frontend documentation
- ✅ Added database migration for blog media fields

---

## 📚 Additional Resources

- **API Testing:** Use Postman collection (coming soon)
- **Example Projects:** Reference implementations (coming soon)
- **Video Tutorials:** Integration walkthroughs (coming soon)

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready
