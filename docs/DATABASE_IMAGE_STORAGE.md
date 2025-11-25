# Database Image Storage - Implementation Guide

## Overview
Images are now stored directly in your PostgreSQL database on Render instead of the filesystem or AWS S3. This ensures images persist across deployments and server restarts.

## Why Database Storage?

### Problem with Filesystem Storage
- **Ephemeral storage**: Render's filesystem is wiped on every deployment or restart
- **Images disappear**: Files stored locally vanish after some time
- **No persistence**: Cannot rely on local storage in cloud environments

### Benefits of Database Storage
- ✅ **Persistent**: Images survive deployments and restarts
- ✅ **No external dependencies**: No need for AWS S3 or other cloud storage
- ✅ **Simplified architecture**: Everything in one database
- ✅ **Automatic backups**: Images backed up with your database
- ✅ **Cost-effective**: No additional storage service fees

## Database Schema

### Media Files Table
```sql
CREATE TABLE hakikisha.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER,
  file_data TEXT NOT NULL, -- Base64 encoded image data
  uploaded_by UUID REFERENCES hakikisha.users(id),
  upload_type VARCHAR(50) DEFAULT 'general', -- 'blog', 'claim', 'profile', 'general'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## How It Works

### 1. Image Upload Flow
```
Frontend (React Native)
    ↓
Convert image to base64
    ↓
POST /api/v1/upload/image
    ↓
Backend stores base64 in PostgreSQL
    ↓
Returns URL: /api/v1/upload/images/{mediaId}
```

### 2. Image Retrieval Flow
```
Frontend requests image URL
    ↓
GET /api/v1/upload/images/{mediaId}
    ↓
Backend fetches from PostgreSQL
    ↓
Converts base64 to binary buffer
    ↓
Serves image with proper Content-Type
```

## API Endpoints

### Upload Image (Base64)
```http
POST /api/v1/upload/image
Content-Type: application/json
Authorization: Bearer {token}

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}

Response:
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://your-api.com/api/v1/upload/images/{mediaId}",
  "filename": "image-{uuid}.jpg",
  "mediaId": "{uuid}"
}
```

### Upload Image (Multipart)
```http
POST /api/v1/upload/multipart
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
- image: [binary file]

Response:
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://your-api.com/api/v1/upload/images/{mediaId}",
  "filename": "image-{uuid}.jpg",
  "mediaId": "{uuid}"
}
```

### Retrieve Image
```http
GET /api/v1/upload/images/{mediaId}

Response:
- Content-Type: image/jpeg (or png, etc.)
- Cache-Control: public, max-age=31536000
- [Binary image data]
```

## Frontend Implementation

### Blog Creation with Image
```typescript
// In blogService.ts
async uploadBlogImage(imageUri: string): Promise<string> {
  const base64 = await RNFS.readFile(imageUri, 'base64');
  const response = await fetch(`${API_BASE_URL}/api/v1/upload/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      image: `data:image/jpeg;base64,${base64}`
    }),
  });
  const result = await response.json();
  return result.imageUrl; // Use this URL in blog featured_image field
}
```

### Display Image in Component
```tsx
// Images are served from the database
<Image 
  source={{ uri: blog.featured_image }}
  style={styles.image}
/>

// The URL format: https://your-api.com/api/v1/upload/images/{mediaId}
```

## Performance Considerations

### Caching
- Images are cached for 1 year (`max-age=31536000`)
- Browser/app will cache images after first load
- Reduces database queries for frequently accessed images

### Size Limits
- Maximum file size: 10MB (configurable)
- Recommended: Compress images before upload
- Consider resizing large images on the frontend

### Database Storage
- Base64 encoding increases size by ~33%
- 1MB image = ~1.3MB in database
- Monitor database size as image count grows

## Migration

### Run the Migration
The migration `028_create_media_storage_table.js` creates the necessary table.

To apply:
```bash
# If you have a migration runner
npm run migrate

# Or manually connect to your database and run:
CREATE TABLE hakikisha.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER,
  file_data TEXT NOT NULL,
  uploaded_by UUID REFERENCES hakikisha.users(id),
  upload_type VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_files_uploaded_by ON hakikisha.media_files(uploaded_by);
CREATE INDEX idx_media_files_upload_type ON hakikisha.media_files(upload_type);
CREATE INDEX idx_media_files_created_at ON hakikisha.media_files(created_at);
```

## Cleanup Old Files

### Remove Filesystem Storage
The old `uploads/` directory is no longer needed:
```bash
rm -rf uploads/
```

### Remove AWS Configuration
You can remove these environment variables:
```env
# No longer needed:
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=
CLOUDFRONT_DISTRIBUTION=
```

## Monitoring

### Check Storage Usage
```sql
-- Total images stored
SELECT COUNT(*) FROM hakikisha.media_files;

-- Total storage used (approximate)
SELECT 
  COUNT(*) as image_count,
  SUM(file_size) / 1024 / 1024 as total_mb,
  AVG(file_size) / 1024 as avg_size_kb
FROM hakikisha.media_files;

-- Images by type
SELECT 
  upload_type,
  COUNT(*) as count,
  SUM(file_size) / 1024 / 1024 as total_mb
FROM hakikisha.media_files
GROUP BY upload_type;
```

### Cleanup Old Images
```sql
-- Delete images older than 6 months with no references
DELETE FROM hakikisha.media_files
WHERE created_at < NOW() - INTERVAL '6 months'
  AND upload_type = 'general';
```

## Troubleshooting

### Images Not Displaying
1. Check the URL format: Should be `/api/v1/upload/images/{mediaId}`
2. Verify media ID exists in database
3. Check browser console for 404 or 500 errors
4. Ensure proper authentication headers for upload

### Upload Failures
1. Verify image is proper base64 format
2. Check file size is under 10MB limit
3. Ensure database connection is working
4. Check disk space on Render PostgreSQL instance

### Performance Issues
1. Add database indexes if queries are slow
2. Consider implementing CDN for frequently accessed images
3. Reduce image sizes before upload
4. Monitor database size and implement cleanup strategy

## Future Enhancements

### Potential Improvements
- [ ] Image compression on upload
- [ ] Thumbnail generation
- [ ] Support for multiple image sizes
- [ ] Image optimization (WebP conversion)
- [ ] CDN integration for faster delivery
- [ ] Image analytics (view counts, popular images)

## Support

For issues or questions:
1. Check logs in Render dashboard
2. Verify database migrations ran successfully
3. Test upload endpoint with curl/Postman
4. Check PostgreSQL storage limits on Render plan
