# Blog Image Upload - Frontend Implementation Guide

## Problem
When fact checkers try to upload images for blog posts, they receive a 400 error because the frontend is sending a file URI (`file:///...`) instead of base64-encoded image data that the backend expects.

## Backend Expectations

The `/api/v1/upload/image` endpoint expects:
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..." 
  }
  ```
- The `image` field must be a base64-encoded string starting with `data:image/[type];base64,`

## Frontend Changes Required

### Option 1: Convert Image to Base64 (Recommended for React Native)

If you're using React Native Image Picker, you need to convert the file URI to base64:

```javascript
import * as FileSystem from 'expo-file-system';
// or for react-native-image-picker
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

// Step 1: Pick the image
const pickImage = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
  });

  if (result.assets && result.assets[0]) {
    const imageUri = result.assets[0].uri;
    
    // Step 2: Convert to base64
    const base64Image = await RNFS.readFile(imageUri, 'base64');
    const mimeType = result.assets[0].type || 'image/jpeg';
    const base64WithPrefix = `data:${mimeType};base64,${base64Image}`;
    
    // Step 3: Upload
    await uploadImage(base64WithPrefix);
  }
};

const uploadImage = async (base64Image) => {
  const token = await AsyncStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/api/v1/upload/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ image: base64Image }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Upload failed');
  }
  
  return result.imageUrl;
};
```

### Option 2: Use FormData (Multipart Upload)

Alternatively, use the `/api/v1/upload/multipart` endpoint with FormData:

```javascript
const uploadImageWithFormData = async (imageUri) => {
  const token = await AsyncStorage.getItem('authToken');
  
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'blog-image.jpg',
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/upload/multipart`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type header - let fetch set it automatically with boundary
    },
    body: formData,
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Upload failed');
  }
  
  return result.imageUrl;
};
```

## Required Packages

### For Base64 Conversion:
```bash
# React Native
npm install react-native-fs

# Or for Expo
npx expo install expo-file-system
```

### For Image Picker:
```bash
# React Native
npm install react-native-image-picker

# Or for Expo
npx expo install expo-image-picker
```

## Complete Blog Submission Flow

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

const submitBlogWithImage = async (blogData) => {
  try {
    let featuredImageUrl = null;

    // Step 1: If user selected an image, upload it first
    if (blogData.imageUri) {
      console.log('📤 Uploading image...');
      
      // Convert to base64
      const base64Image = await RNFS.readFile(blogData.imageUri, 'base64');
      const base64WithPrefix = `data:image/jpeg;base64,${base64Image}`;
      
      // Upload image
      const token = await AsyncStorage.getItem('authToken');
      const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/upload/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ image: base64WithPrefix }),
      });

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }
      
      featuredImageUrl = uploadResult.imageUrl;
      console.log('✅ Image uploaded:', featuredImageUrl);
    }

    // Step 2: Create/publish blog with the uploaded image URL
    const blogPayload = {
      title: blogData.title,
      content: blogData.content,
      category: blogData.category,
      featured_image: featuredImageUrl,
      status: 'published',
    };

    const token = await AsyncStorage.getItem('authToken');
    const blogResponse = await fetch(`${API_BASE_URL}/api/v1/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(blogPayload),
    });

    const blogResult = await blogResponse.json();
    
    if (!blogResponse.ok) {
      throw new Error(blogResult.error || 'Blog creation failed');
    }
    
    console.log('✅ Blog published successfully');
    return blogResult;
    
  } catch (error) {
    console.error('❌ Error publishing blog:', error);
    throw error;
  }
};
```

## Error Handling

The backend now provides detailed error messages:

```javascript
{
  "success": false,
  "error": "Invalid image format. Please provide a base64 encoded image.",
  "code": "VALIDATION_ERROR",
  "details": "Image must be a base64 string in format: data:image/[type];base64,[data]",
  "received": "file:///data/user/0/..."
}
```

This will help debug what's being sent vs what's expected.

## Testing Checklist

- [ ] Install required packages (react-native-fs or expo-file-system)
- [ ] Update image picker to convert to base64
- [ ] Test image upload endpoint separately
- [ ] Verify uploaded image URL is returned correctly
- [ ] Test blog creation with featured image
- [ ] Verify image displays correctly in blog list/detail views
- [ ] Test without image (should still work)
- [ ] Test with different image formats (JPEG, PNG)
- [ ] Test with large images (>5MB)

## Common Issues

1. **"No image data provided"**: Check that `image` field exists in request body
2. **"Invalid image format"**: Ensure image is base64 string starting with `data:image/`
3. **"Upload failed: 400"**: Check the `details` field in error response for specific issue
4. **Large payload**: For images >10MB, consider using multipart upload instead

## Next Steps

1. Update your React Native screen that handles blog creation
2. Add base64 conversion before upload
3. Handle upload errors with user-friendly messages
4. Test thoroughly with different image sizes and formats
