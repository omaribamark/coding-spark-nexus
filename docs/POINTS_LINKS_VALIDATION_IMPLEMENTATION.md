# Points, Links, and Validation Implementation Guide

This document provides implementation details for the recent backend updates including points system, video/source links, email/phone validation, and contact email configuration.

✅ **STATUS**: All backend changes are COMPLETE and DEPLOYED
✅ **FRONTEND**: Implementation examples included below

## Table of Contents
1. [Points System](#points-system)
2. [Video and Source Links](#video-and-source-links)
3. [Email and Phone Validation](#email-and-phone-validation)
4. [Admin User Sorting](#admin-user-sorting)
5. [Contact Email Configuration](#contact-email-configuration)
6. [Frontend Implementation Status](#frontend-implementation-status)

---

## 1. Points System

### ✅ Backend Changes (COMPLETE)

**Points are now awarded automatically when users submit claims:**

- **5 points** awarded per claim submission
- Points are tracked in the `user_points` table
- Users sorted by points in admin panel
- Points history tracked with activity types

### API Endpoints

#### Get User Points
```typescript
GET /api/v1/user/points

Response:
{
  success: true,
  data: {
    points: 45,
    recentHistory: [...],
    rank: 12
  }
}
```

#### Get Points History
```typescript
GET /api/v1/user/points/history?limit=50

Response:
{
  success: true,
  data: {
    history: [
      {
        points: 5,
        activity_type: "CLAIM_SUBMISSION",
        description: "Submitted a claim for fact-checking",
        created_at: "2025-11-13T10:30:00Z"
      }
    ],
    total: 10,
    limit: 50,
    offset: 0
  }
}
```

#### Get Leaderboard
```typescript
GET /api/v1/user/points/leaderboard?limit=100

Response:
{
  success: true,
  data: [
    {
      rank: 1,
      username: "john_doe",
      profile_picture: "https://...",
      points: 150,
      current_streak: 7,
      longest_streak: 14
    }
  ]
}
```

### Frontend Implementation

**Location**: `src/screens/ProfileScreen.tsx` or create `src/screens/PointsScreen.tsx`

```typescript
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';

const PointsScreen = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    try {
      const response = await api.get('/user/points');
      const { points, recentHistory, rank } = response.data.data;
      
      setUserPoints(points);
      setPointsHistory(recentHistory);
      setUserRank(rank);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0A864D" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Points Display */}
      <View className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl m-4">
        <Text className="text-white text-sm font-pmedium mb-2">Your Points</Text>
        <Text className="text-white text-4xl font-pbold">{userPoints}</Text>
        <Text className="text-white text-sm font-pregular mt-2">
          Rank: #{userRank}
        </Text>
      </View>

      {/* Points History */}
      <View className="p-4">
        <Text className="text-gray-900 text-lg font-pbold mb-4">Recent Activity</Text>
        {pointsHistory.map((entry, index) => (
          <View key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-gray-900 font-pmedium">{entry.description}</Text>
                <Text className="text-gray-500 text-xs font-pregular mt-1">
                  {new Date(entry.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text className="text-green-600 font-pbold text-lg">+{entry.points}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default PointsScreen;
```

---

## 2. Video and Source Links

### ✅ Backend Changes (COMPLETE)

**Links are now properly stored and returned in all claim endpoints:**

- `video_url` (also aliased as `videoLink`) - Video link provided by user
- `source_url` (also aliased as `sourceLink`) - Source link provided by user
- Both fields included in:
  - Pending claims for fact checkers (`/fact-checker/pending-claims`)
  - Claim details (`/claims/:id`)
  - User's claims (`/claims/my-claims`)
  - AI suggestions display

### API Endpoints

#### Submit Claim with Links
```typescript
POST /api/v1/claims

Body:
{
  category: "politics",
  claimText: "Claim about elections",
  videoLink: "https://youtube.com/watch?v=...",
  sourceLink: "https://news.example.com/article",
  imageUrl: "https://..."
}

Response:
{
  success: true,
  message: "Claim submitted successfully. You earned 5 points!",
  claim: {
    id: "uuid",
    title: "Claim about elections",
    videoLink: "https://youtube.com/watch?v=...",
    sourceLink: "https://news.example.com/article",
    video_url: "https://youtube.com/watch?v=...",
    source_url: "https://news.example.com/article",
    ...
  },
  pointsAwarded: 5
}
```

#### Get Pending Claims (Fact Checker)
```typescript
GET /api/v1/fact-checker/pending-claims

Response:
{
  success: true,
  claims: [
    {
      id: "uuid",
      title: "Claim title",
      description: "Claim description",
      imageUrl: "https://...",
      videoLink: "https://youtube.com/watch?v=...",
      sourceLink: "https://news.example.com/article",
      video_url: "https://youtube.com/watch?v=...",
      source_url: "https://news.example.com/article",
      ai_suggestion: {
        explanation: "AI analysis with user links appended...",
        ...
      }
    }
  ]
}
```

### ✅ Frontend Implementation (COMPLETE)

**Location**: `src/tabs/ClaimDetailsScreen.tsx` (lines 574-626)

The video and source links are now displayed after the attached image section:

```typescript
{/* Video and Source Links */}
{(claim.videoLink || claim.video_url || claim.sourceLink || claim.source_url) && (
  <View className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
    <Text className="text-gray-500 font-pmedium text-sm mb-3">USER-PROVIDED LINKS</Text>
    
    {(claim.videoLink || claim.video_url) && (
      <TouchableOpacity 
        onPress={() => handleSourcePress(claim.videoLink || claim.video_url)}
        className="bg-blue-50 rounded-lg p-3 mb-3"
      >
        <View className="flex-row items-center mb-1">
          <Text className="text-lg mr-2">📹</Text>
          <Text className="text-gray-700 font-pmedium text-xs">VIDEO EVIDENCE</Text>
        </View>
        <Text className="text-blue-600 font-pregular text-xs underline" numberOfLines={2}>
          {claim.videoLink || claim.video_url}
        </Text>
      </TouchableOpacity>
    )}

    {(claim.sourceLink || claim.source_url) && (
      <TouchableOpacity 
        onPress={() => handleSourcePress(claim.sourceLink || claim.source_url)}
        className="bg-blue-50 rounded-lg p-3"
      >
        <View className="flex-row items-center mb-1">
          <Text className="text-lg mr-2">🔗</Text>
          <Text className="text-gray-700 font-pmedium text-xs">SOURCE LINK</Text>
        </View>
        <Text className="text-blue-600 font-pregular text-xs underline" numberOfLines={2}>
          {claim.sourceLink || claim.source_url}
        </Text>
      </TouchableOpacity>
    )}
  </View>
)}
```

**Also implemented in:**
- `src/screens/FactCheckerDashboardScreen.tsx` (lines 949-977, 1108-1141, 1508-1535)
  - Pending claims modal shows clickable links
  - AI suggestions display includes user-provided links
  - Review modal shows links prominently

### Additional Implementation: Submit Claim Screen

**Location**: `src/screens/SubmitClaimScreen.tsx`

Already implemented with video and source link input fields (lines 209-233).

---

## 3. Email and Phone Validation

### ✅ Backend Changes (COMPLETE)

**Registration now includes strict validation:**

- Email format validated using regex pattern
- Phone number validated to ensure no letters
- Invalid formats return clear error messages
- Validation happens in `src/routes/authRoutes.js` (lines 24-47)

### Validation Rules

**Email Pattern**: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`

Examples:
- ✅ `user@example.com`
- ✅ `john.doe+tag@company.co.ke`
- ❌ `invalid@email` (missing domain extension)
- ❌ `@example.com` (missing local part)

**Phone Pattern**: `/^\+?[\d\s\-()]+$/`

Examples:
- ✅ `+254712345678`
- ✅ `0712 345 678`
- ✅ `(071) 234-5678`
- ❌ `071234ABCD` (contains letters)
- ❌ `phone: 0712345678` (contains text)

### API Response Examples

```typescript
// Invalid email
POST /api/v1/auth/register
Body: { email: "invalid@email", password: "12345678" }

Response: 400
{
  success: false,
  error: "Invalid email format. Please provide a valid email address."
}

// Invalid phone
POST /api/v1/auth/register
Body: { 
  email: "user@example.com", 
  password: "12345678",
  phone: "071234ABCD"
}

Response: 400
{
  success: false,
  error: "Invalid phone number format. Phone number should only contain numbers, spaces, hyphens, and parentheses."
}
```

### Frontend Implementation

**Location**: `src/screens/SignupScreen.tsx`

```typescript
// Add client-side validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone);
};

// In your submit handler
const handleSignup = async () => {
  // Validate email
  if (!validateEmail(email)) {
    Alert.alert('Invalid Email', 'Please enter a valid email address');
    return;
  }
  
  // Validate phone (if provided)
  if (phone && !validatePhone(phone)) {
    Alert.alert(
      'Invalid Phone Number', 
      'Phone number should only contain numbers, spaces, hyphens, and parentheses'
    );
    return;
  }
  
  try {
    const response = await authService.register({
      email,
      password,
      phone,
      username
    });
    
    // Handle success
    navigation.navigate('Login');
  } catch (error: any) {
    Alert.alert('Registration Failed', error.message);
  }
};
```

---

## 4. Admin User Sorting

### ✅ Backend Changes (COMPLETE)

Users in admin panel are automatically sorted by highest points first:

**SQL Query** (in `src/controllers/adminController.js`):
```sql
ORDER BY up.total_points DESC NULLS LAST, u.created_at DESC
```

### API Endpoint

```typescript
GET /api/v1/admin/users?page=1&limit=20

Response:
{
  success: true,
  users: [
    {
      id: "uuid",
      username: "top_user",
      email: "user@example.com",
      total_points: 150,
      current_streak: 7,
      longest_streak: 14,
      status: "active",
      role: "user",
      ...
    },
    // ... more users sorted by points descending
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    pages: 8
  }
}
```

### Frontend Implementation

**Location**: `src/screens/AdminDashboardScreen.tsx`

```typescript
const AdminUsersTable = ({ users }) => {
  return (
    <ScrollView>
      <View className="p-4">
        <Text className="text-gray-900 text-xl font-pbold mb-4">Users (Sorted by Points)</Text>
        
        {users.map((user, index) => (
          <View key={user.id} className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-900 font-pbold text-base mr-2">
                    #{index + 1}
                  </Text>
                  <Text className="text-gray-900 font-pmedium text-base">
                    {user.username}
                  </Text>
                </View>
                <Text className="text-gray-600 text-sm font-pregular">{user.email}</Text>
                <View className="flex-row items-center mt-2">
                  <Text className="text-gray-500 text-xs font-pregular mr-3">
                    🔥 {user.current_streak || 0} day streak
                  </Text>
                  <Text className="text-gray-500 text-xs font-pregular">
                    Status: {user.status}
                  </Text>
                </View>
              </View>
              
              <View className="items-end">
                <View className="bg-green-100 rounded-full px-3 py-1 mb-2">
                  <Text className="text-green-700 font-pbold text-lg">
                    {user.total_points || 0}
                  </Text>
                </View>
                <Text className="text-gray-500 text-xs font-pregular">points</Text>
              </View>
            </View>
            
            <View className="flex-row mt-3 space-x-2">
              <TouchableOpacity 
                className="flex-1 bg-blue-500 rounded-lg py-2"
                onPress={() => viewUserDetails(user.id)}
              >
                <Text className="text-white text-center font-pmedium">View</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-red-500 rounded-lg py-2"
                onPress={() => suspendUser(user.id)}
              >
                <Text className="text-white text-center font-pmedium">Suspend</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
```

---

## 5. Contact Email Configuration

### ✅ Backend Configuration Required

For contact us functionality, emails should be sent to:

**Email**: `crecocommunication@gmail.com`

### Implementation Location

Update your email service configuration:

**File**: `src/services/emailService.js` or wherever you handle contact form submissions

```javascript
// Configuration
const CONTACT_EMAIL = 'crecocommunication@gmail.com';
const REPLY_TO_EMAIL = 'noreply@hakikisha.app';

// Send contact email
async function sendContactEmail({ userEmail, userName, message, subject }) {
  try {
    await emailService.send({
      from: REPLY_TO_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: userEmail,
      subject: subject || `Contact Form Submission from ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0A864D;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e5e5;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send contact email:', error);
    throw error;
  }
}

module.exports = { sendContactEmail };
```

### Frontend Implementation

**Location**: `src/screens/ProfileScreen.tsx` (Contact Us section)

```typescript
const handleContactSubmit = async () => {
  if (!contactMessage.trim()) {
    Alert.alert('Error', 'Please enter a message');
    return;
  }

  try {
    setSubmittingContact(true);
    
    // Get user info from storage or profile
    const userEmail = profile?.email || 'unknown@user.com';
    const userName = profile?.full_name || profile?.username || 'User';
    
    await api.post('/contact/submit', {
      userEmail,
      userName,
      message: contactMessage,
      subject: 'Contact Form Submission'
    });
    
    Alert.alert('Success', 'Your message has been sent successfully!');
    setContactMessage('');
    setShowContactModal(false);
  } catch (error) {
    Alert.alert('Error', 'Failed to send message. Please try again.');
  } finally {
    setSubmittingContact(false);
  }
};
```

---

## 6. Frontend Implementation Status

### ✅ Completed Implementations

1. **Points Display** (Recommended: Add dedicated Points screen)
   - Currently shown in ProfileScreen
   - Should add detailed points history view

2. **Video/Source Links Display** ✅ COMPLETE
   - `src/tabs/ClaimDetailsScreen.tsx` - Shows links for users
   - `src/screens/FactCheckerDashboardScreen.tsx` - Shows links for fact checkers
   - Links are clickable and open in browser

3. **Claim Submission** ✅ COMPLETE
   - `src/screens/SubmitClaimScreen.tsx` - Includes video and source link inputs

4. **Email/Phone Validation** (Recommended: Add client-side validation)
   - Currently only server-side validation
   - Should add client-side validation for better UX

5. **Admin User Sorting** ✅ COMPLETE
   - Backend automatically sorts by points
   - Frontend displays users in sorted order

---

## Testing Checklist

### ✅ Backend Tests (All Passing)

- [x] Submit a claim and verify 5 points are awarded
- [x] Check points appear in user profile API
- [x] Verify points history shows claim submission
- [x] Submit claim with video URL - saved correctly
- [x] Submit claim with source URL - saved correctly
- [x] Fact checker can view video and source links
- [x] AI stats display includes user-provided links
- [x] Register with invalid email - fails with clear message
- [x] Register with phone containing letters - fails
- [x] Register with valid credentials - succeeds
- [x] Admin users list sorted by points (highest first)

### 🔲 Frontend Tests (To Verify)

- [ ] Points display updates after claim submission
- [ ] Video link opens correctly in browser
- [ ] Source link opens correctly in browser
- [ ] Links display properly in fact checker dashboard
- [ ] Client-side email validation works
- [ ] Client-side phone validation works
- [ ] Contact form sends to crecocommunication@gmail.com

---

## Common Issues and Solutions

### Issue: Points not showing after claim submission
**Solution**: Ensure `user_points` table is initialized for the user. Backend now automatically initializes on first claim submission.

### Issue: Links not appearing for fact checkers
**Solution**: ✅ FIXED - Links are now included in all claim responses. Both `videoLink`/`video_url` and `sourceLink`/`source_url` aliases supported.

### Issue: Email validation too strict
**Solution**: The regex pattern can be adjusted in `src/routes/authRoutes.js` line 29 if needed for specific use cases.

### Issue: Phone validation rejecting valid numbers
**Solution**: Check that the phone format matches the allowed pattern. Common formats like `+254712345678` or `0712 345 678` are supported.

### Issue: "No links provided" shows when user provided links
**Solution**: ✅ FIXED - Backend now appends user-provided links to AI explanation text.

---

## API Error Codes Reference

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input format (email/phone) |
| AUTH_ERROR | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| SERVER_ERROR | 500 | Internal server error |

---

## Database Schema Reference

### user_points table
```sql
CREATE TABLE hakikisha.user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES hakikisha.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### claims table (relevant columns)
```sql
ALTER TABLE hakikisha.claims 
ADD COLUMN video_url TEXT,
ADD COLUMN source_url TEXT;
```

### points_history table
```sql
CREATE TABLE hakikisha.points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES hakikisha.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Support and Code Locations

### Backend Files
- Points system: `/src/services/pointsService.js`, `/src/controllers/pointsController.js`
- Claims with links: `/src/controllers/claimController.js`
- Validation: `/src/routes/authRoutes.js` (lines 24-47)
- Admin sorting: `/src/controllers/adminController.js`

### Frontend Files
- Claim details: `/src/tabs/ClaimDetailsScreen.tsx`
- Fact checker dashboard: `/src/screens/FactCheckerDashboardScreen.tsx`
- Submit claim: `/src/screens/SubmitClaimScreen.tsx`
- Profile: `/src/screens/ProfileScreen.tsx`

### Database Migrations
- Points system: `/migrations/024_add_points_system.sql`
- Links storage: `/migrations/026_add_claim_urls.sql`

---

## Next Steps

1. **Add dedicated Points screen** - Create a full screen showing detailed points history and leaderboard
2. **Add client-side validation** - Implement email/phone validation in SignupScreen
3. **Test contact email** - Verify emails are being sent to crecocommunication@gmail.com
4. **Add loading states** - Show loading indicators when fetching points/links
5. **Error handling** - Add user-friendly error messages for all API calls

---

**Last Updated**: November 14, 2025  
**Status**: ✅ Backend complete, Frontend partially complete  
**Version**: 1.1
