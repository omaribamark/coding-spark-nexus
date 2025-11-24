# Image Upload Guide for React Native Frontend

## Problem
The backend `/api/v1/upload/image` endpoint expects **base64 encoded images**, but React Native's image picker returns **local file URIs** like `file:///data/user/0/...`.

## Solution

You need to convert the local file URI to base64 before sending to the backend.

### Step 1: Install Required Package

```bash
npm install react-native-fs
# or
yarn add react-native-fs
```

### Step 2: Import Required Modules

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
// OR if using react-native-fs:
// import RNFS from 'react-native-fs';
```

### Step 3: Update Image Upload Function

#### Option A: Using Expo FileSystem (Recommended for Expo projects)

```typescript
const uploadImage = async (imageUri: string) => {
  try {
    console.log('📤 Converting image to base64...');
    
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Get file extension from URI
    const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Create proper base64 data URI
    const base64Image = `data:image/${fileExtension};base64,${base64}`;
    
    console.log('📤 Uploading image to backend...');
    
    // Now send to backend
    const response = await apiService.post('/upload/image', {
      image: base64Image
    });
    
    console.log('✅ Image uploaded:', response.data.imageUrl);
    return response.data.imageUrl;
    
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};
```

#### Option B: Using react-native-fs

```typescript
import RNFS from 'react-native-fs';

const uploadImage = async (imageUri: string) => {
  try {
    console.log('📤 Converting image to base64...');
    
    // Remove file:// prefix if present
    const filePath = imageUri.replace('file://', '');
    
    // Read the file as base64
    const base64 = await RNFS.readFile(filePath, 'base64');
    
    // Get file extension
    const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Create proper base64 data URI
    const base64Image = `data:image/${fileExtension};base64,${base64}`;
    
    console.log('📤 Uploading image to backend...');
    
    // Send to backend
    const response = await apiService.post('/upload/image', {
      image: base64Image
    });
    
    console.log('✅ Image uploaded:', response.data.imageUrl);
    return response.data.imageUrl;
    
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};
```

### Step 4: Update Blog and Verdict Image Pickers

#### Blog Featured Image Upload

```typescript
const pickBlogImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const imageUri = result.assets[0].uri;
      
      // Convert to base64 and upload
      const uploadedUrl = await uploadImage(imageUri);
      
      // Update form with the uploaded URL
      setBlogForm(prev => ({
        ...prev,
        featured_image: uploadedUrl
      }));
      
      Alert.alert('Success', 'Image uploaded successfully!');
    }
  } catch (error) {
    console.error('Error picking blog image:', error);
    Alert.alert('Error', 'Failed to upload image');
  }
};
```

#### Verdict Evidence Image Upload

```typescript
const pickVerdictImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const imageUri = result.assets[0].uri;
      
      // Convert to base64 and upload
      const uploadedUrl = await uploadImage(imageUri);
      
      // Update form with the uploaded URL
      setVerdictForm(prev => ({
        ...prev,
        evidence_image_url: uploadedUrl
      }));
      
      Alert.alert('Success', 'Evidence image uploaded successfully!');
    }
  } catch (error) {
    console.error('Error picking verdict image:', error);
    Alert.alert('Error', 'Failed to upload image');
  }
};
```

### Step 5: Update Camera Capture

```typescript
const takeBlogPhoto = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const imageUri = result.assets[0].uri;
      
      // Convert to base64 and upload
      const uploadedUrl = await uploadImage(imageUri);
      
      // Update form with the uploaded URL
      setBlogForm(prev => ({
        ...prev,
        featured_image: uploadedUrl
      }));
      
      Alert.alert('Success', 'Photo uploaded successfully!');
    }
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to upload photo');
  }
};
```

## Alternative: Use Multipart Upload

If you prefer not to convert to base64 (which can be memory-intensive for large images), you can use the multipart endpoint instead:

```typescript
const uploadImageMultipart = async (imageUri: string) => {
  try {
    const formData = new FormData();
    
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg', // or detect from file extension
      name: `image-${Date.now()}.jpg`,
    } as any);
    
    const response = await fetch(`${API_BASE_URL}/upload/multipart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.imageUrl;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
```

## Summary of Changes Needed

1. **Install dependency**: `expo-file-system` or `react-native-fs`
2. **Create `uploadImage` helper function** that converts file URI to base64
3. **Update `pickBlogImage` function** to use the helper
4. **Update `pickVerdictImage` function** to use the helper
5. **Update `takeBlogPhoto` function** to use the helper
6. **Update `takeVerdictPhoto` function** to use the helper

## Testing

After making these changes, test with:
1. Selecting an image from gallery for blog
2. Taking a photo with camera for blog
3. Selecting an image for verdict evidence
4. Taking a photo for verdict evidence

All should now upload successfully without 400 errors.

## API Endpoints

- **Base64 Upload**: `POST /api/v1/upload/image` - Expects `{ image: "data:image/..." }`
- **Multipart Upload**: `POST /api/v1/upload/multipart` - Expects `FormData` with `image` field
- **Get Image**: `GET /api/v1/upload/images/:filename`

## Error Messages

The backend now provides helpful error messages:
- If you send a local file URI, it will tell you to convert to base64 first
- If you send invalid data, it will show what format is expected
- If upload fails, it will indicate whether to use the multipart endpoint instead
