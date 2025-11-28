# Frontend Image Integration Guide

## Overview
All images (claims, blogs, profiles) are now stored in the PostgreSQL database on Render. This ensures images **never go blank** and persist across deployments, accessible to all users.

## Backend Changes Completed ✅

### 1. Database Storage
- Images are stored as base64 in `hakikisha.media_files` table
- Each image gets a unique UUID identifier
- Images are tagged with `upload_type` ('claim', 'blog', 'profile', 'general')
- **Images persist permanently** - no more ephemeral filesystem issues

### 2. Public Image Access
- **Endpoint**: `GET /api/v1/upload/images/:mediaId`
- **Authentication**: ❌ Not required (PUBLIC endpoint for claims/blogs)
- **Returns**: Image binary data with proper content-type headers
- **Caching**: 1 year browser cache for performance

### 3. Image Types Now Using Database
- ✅ **Claim images** - stored in database, public access
- ✅ **Blog featured images** - stored in database, public access
- ✅ **Profile pictures** - stored in database, user-specific URLs
- ✅ All images persist across server restarts and deployments

---

## Frontend Integration Steps

### Step 1: Submitting Claims with Images

**Current Frontend Code (if using base64):**
```javascript
// When user selects an image
const handleImageSelect = async (imageFile) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Image = e.target.result; // data:image/jpeg;base64,/9j/4AAQ...
    
    // Store this for submission
    setSelectedImage(base64Image);
  };
  reader.readAsDataURL(imageFile);
};

// When submitting the claim
const submitClaim = async (claimData) => {
  const payload = {
    category: claimData.category,
    claimText: claimData.claimText,
    videoLink: claimData.videoLink || null,
    sourceLink: claimData.sourceLink || null,
    imageUrl: selectedImage // Send the base64 string directly
  };

  const response = await fetch('https://your-api.com/api/v1/claims', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  // result.claim will contain the claim data
  // The claim.media_url will be a public URL like:
  // https://your-api.com/api/v1/upload/images/123e4567-e89b-12d3-a456-426614174000
};
```

**✅ No Changes Needed!** The backend now handles base64 images automatically.

---

### Step 2: Displaying Claim Images

**Display images from claims:**
```javascript
const ClaimCard = ({ claim }) => {
  return (
    <div className="claim-card">
      <h3>{claim.title}</h3>
      <p>{claim.description}</p>
      
      {/* Display the image - it's a public URL, no auth needed */}
      {claim.media_url && claim.media_type === 'image' && (
        <img 
          src={claim.media_url} 
          alt={claim.title}
          className="claim-image"
          onError={(e) => {
            console.error('Failed to load image:', claim.media_url);
            e.target.style.display = 'none'; // Hide broken image
          }}
        />
      )}
      
      {/* Display video if applicable */}
      {claim.video_url && (
        <video controls src={claim.video_url} />
      )}
    </div>
  );
};
```

---

### Step 3: Alternative - Direct Upload to `/api/v1/upload/image`

If you prefer to upload images first, then submit the claim:

```javascript
// Step 1: Upload image
const uploadImage = async (base64Image) => {
  const response = await fetch('https://your-api.com/api/v1/upload/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({ image: base64Image })
  });

  const result = await response.json();
  // Returns: { success: true, imageUrl: "https://...", mediaId: "uuid" }
  return result.imageUrl;
};

// Step 2: Submit claim with the returned URL
const submitClaimWithImage = async (claimData, imageFile) => {
  let imageUrl = null;
  
  if (imageFile) {
    // Convert to base64 first
    const base64Image = await convertToBase64(imageFile);
    // Upload and get public URL
    imageUrl = await uploadImage(base64Image);
  }

  const payload = {
    category: claimData.category,
    claimText: claimData.claimText,
    imageUrl: imageUrl, // Use the uploaded image URL
    videoLink: claimData.videoLink || null,
    sourceLink: claimData.sourceLink || null
  };

  const response = await fetch('https://your-api.com/api/v1/claims', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
};

// Helper function
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

---

### Step 4: Profile Picture Upload

Profile pictures use multipart form upload and are stored with full URLs:

```javascript
const uploadProfilePicture = async (imageFile) => {
  const formData = new FormData();
  formData.append('profile_picture', imageFile);

  const response = await fetch('https://your-api.com/api/v1/user/profile-picture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`
      // Don't set Content-Type - browser sets it automatically
    },
    body: formData
  });

  const result = await response.json();
  // result.data.profile_picture contains the full database URL
  return result.data.profile_picture;
};

// Display profile picture
const UserProfile = ({ user }) => {
  return (
    <img 
      src={user.profile_picture} 
      alt={user.username}
      onError={(e) => {
        e.target.src = '/default-avatar.png'; // Fallback
      }}
    />
  );
};
```

### Step 5: Multipart Form Upload (Alternative Method)

If your frontend uses FormData for general images:

```javascript
const uploadImageMultipart = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('https://your-api.com/api/v1/upload/multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`
      // Don't set Content-Type - browser sets it automatically with boundary
    },
    body: formData
  });

  const result = await response.json();
  return result.imageUrl; // Public URL
};
```

---

## Important Notes

### ✅ Images Are PUBLIC
- **No authentication required** to view images
- Anyone with the URL can access the image
- This is intentional - allows all users to see claim images

### 📦 Image Format
- Backend accepts: `data:image/jpeg;base64,...` or `data:image/png;base64,...`
- Supported formats: JPEG, PNG, GIF, WebP
- Max size: 10MB per image

### 🔄 Migration from Old System
If you previously stored images elsewhere:
1. Keep old image URLs working (if possible)
2. New images will use database storage
3. Gradually migrate old images to database (optional)

### 🎨 Example API Response

**POST /api/v1/claims** response:
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "claim": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Sample claim title",
    "category": "Politics",
    "status": "pending",
    "submittedDate": "2025-11-25T14:30:00.000Z",
    "videoUrl": null,
    "sourceUrl": "https://example.com/article",
    "media_url": "https://your-api.com/api/v1/upload/images/789e4567-e89b-12d3-a456-426614174999",
    "media_type": "image"
  },
  "pointsAwarded": 5,
  "isFirstClaim": false
}
```

---

## Testing Image Visibility

### Test 1: Same User (Submitter)
1. User A submits claim with image
2. User A views their claims
3. ✅ Image should display

### Test 2: Different User
1. User A submits claim with image
2. User B views claims list
3. ✅ Image should display (PUBLIC access)

### Test 3: Unauthenticated User
1. User A submits claim with image
2. Open image URL in incognito/private window
3. ✅ Image should display (no login required)

---

## Troubleshooting

### Issue: Images appear blank or disappear after some time ✅ FIXED
**Previous Cause**: Images were stored on ephemeral filesystem  
**Solution**: All images now stored in PostgreSQL database - they never disappear!

### Issue: Profile pictures go blank
**Previous Cause**: Filesystem storage  
**Solution**: Profile pictures now use database storage with full URL persistence

### Issue: Claim images blank for other users ✅ FIXED
**Previous Cause**: Permission/storage issues  
**Solution**: All claim images now public via database URLs - all users can see them

### Issue: "Image not found" error
**Cause**: Media ID doesn't exist in database  
**Solution**: Check backend logs, ensure image was stored successfully during submission

### Issue: Image loads slowly
**Cause**: Large base64 images in database  
**Solution**: 
- Compress images on frontend before upload
- Use lower quality/resolution for thumbnails
- Consider image optimization service in future

### Issue: CORS errors
**Cause**: Different domain between frontend and backend  
**Solution**: Backend has CORS enabled, check browser console for specific error

---

## Performance Tips

1. **Lazy Loading**: Use `loading="lazy"` on `<img>` tags
2. **Image Compression**: Compress images on frontend before upload
3. **Thumbnails**: Request smaller versions for list views (future enhancement)
4. **Caching**: Images are cached for 1 year by browser automatically

---

## Contact & Support

If images still don't display for all users after following this guide:
1. Check browser console for errors
2. Verify the media URL format: `https://domain.com/api/v1/upload/images/{uuid}`
3. Test the URL directly in browser (should download/display image)
4. Check backend logs for database errors

Backend is configured correctly ✅  
Frontend just needs to use the returned `media_url` in `<img src>` tags!
