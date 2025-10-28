# HAKIKISHA Mobile App - Backend Connection Guide

## Backend URL Configuration

Your mobile app is now configured to connect to:
**Base URL:** `https://hakikisha-backend.onrender.com/api/v1`

## CRITICAL: Backend CORS Configuration

For your mobile app to work, you **MUST** configure CORS in your backend to allow requests from the mobile app.

### Required CORS Configuration

Add this to your backend (Node.js/Express example):

```javascript
const cors = require('cors');

const allowedOrigins = [
  'capacitor://localhost',           // For iOS Capacitor
  'http://localhost',                 // For Android Capacitor
  'ionic://localhost',                // For Ionic apps
  'http://localhost:8100',            // For Ionic dev server
  'https://e2280cef-9c3e-485b-aca5-a7c342a041ca.lovableproject.com' // For Lovable preview
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### For Python/Flask Backend:

```python
from flask_cors import CORS

CORS(app, 
     origins=[
         'capacitor://localhost',
         'http://localhost',
         'ionic://localhost',
         'http://localhost:8100',
         'https://e2280cef-9c3e-485b-aca5-a7c342a041ca.lovableproject.com'
     ],
     supports_credentials=True)
```

### For Django Backend:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "capacitor://localhost",
    "http://localhost",
    "ionic://localhost",
    "http://localhost:8100",
    "https://e2280cef-9c3e-485b-aca5-a7c342a041ca.lovableproject.com",
]

CORS_ALLOW_CREDENTIALS = True
```

## API Endpoints Connected

### 1. Authentication (✅ Connected)
- **Register:** `POST /auth/register`
- **Login:** `POST /auth/login`
- **Refresh Token:** `POST /auth/refresh`
- **Forgot Password:** `POST /auth/forgot-password`
- **Reset Password:** `POST /auth/reset-password`

**Files:** `src/services/authService.ts`, `src/screens/LoginScreen.tsx`, `src/screens/SignupScreen.tsx`

### 2. Claims Management (✅ Connected)
- **Submit Claim:** `POST /claims/submit`
- **Get All Claims:** `GET /claims`
- **Get Trending Claims:** `GET /claims/trending`
- **Get Claim by ID:** `GET /claims/:id`
- **Get User Claims:** `GET /user/claims`
- **Search Claims:** `GET /claims/search`

**Files:** `src/services/claimsService.ts`, `src/screens/SubmitClaimScreen.tsx`, `src/tabs/ClaimsTab.tsx`

### 3. User Profile (✅ Connected)
- **Get Profile:** `GET /user/profile`
- **Update Profile:** `PUT /user/profile`
- **Upload Profile Picture:** `POST /user/profile-picture`
- **Change Password:** `POST /user/change-password`

**Files:** `src/services/profileService.ts`, `src/screens/ProfileScreen.tsx`

### 4. Blogs (To be connected)
- **Get All Blogs:** `GET /blogs`
- **Get Single Blog:** `GET /blogs/:blogId`
- **Create Blog:** `POST /blogs/create` (Fact Checkers/Admin)

**Files:** `src/services/blogService.ts`, `src/tabs/BlogsTab.tsx`

### 5. Fact Checker Endpoints (To be connected)
- **Get Pending Claims:** `GET /fact-checker/pending-claims`
- **Submit Verdict:** `POST /fact-checker/submit-verdict`
- **Get AI Suggestions:** `GET /fact-checker/ai-suggestions`
- **Approve AI Verdict:** `POST /fact-checker/approve-ai-verdict`
- **Get Stats:** `GET /fact-checker/stats`

**Files:** `src/services/factCheckerService.ts`, `src/screens/FactCheckerDashboardScreen.tsx`

### 6. Admin Endpoints (To be connected)
- **Get All Users:** `GET /admin/users`
- **Register Fact Checker:** `POST /admin/register-fact-checker`
- **User Actions:** `POST /admin/user-action`
- **Dashboard Stats:** `GET /admin/dashboard-stats`
- **Fact Checker Activity:** `GET /admin/fact-checker-activity`

**Files:** `src/services/adminService.ts`, `src/screens/AdminDashboardScreen.tsx`

## Testing the Connection

### 1. Test on Your Local Device

Since you're running the app locally on your phone using React Native CLI:

```bash
# Make sure your backend is accessible
# Test with curl or Postman first:
curl https://hakikisha-backend.onrender.com/api/v1/health

# Run the React Native app
npx react-native run-android
# or
npx react-native run-ios
```

### 2. Common Connection Issues

#### Issue: "Network Error" or "Failed to Connect"
**Solution:** 
- Ensure your backend CORS is configured correctly
- Check if your backend is running and accessible
- Test backend endpoints with Postman first

#### Issue: "401 Unauthorized"
**Solution:**
- Check if the auth token is being stored correctly
- Verify token format in Authorization header
- Check token expiration

#### Issue: "CORS Error"
**Solution:**
- Add mobile app origins to CORS configuration (see above)
- Ensure `credentials: true` is set in CORS config

## Authentication Flow

1. **User registers** → Token stored in AsyncStorage
2. **User logs in** → Token stored in AsyncStorage
3. **Subsequent requests** → Token automatically added to headers via axios interceptor
4. **Token expires** → Automatic refresh using refresh token
5. **Refresh fails** → User redirected to login

## Debugging Backend Connection

### Enable Network Logging

Add this to your app to see all API calls:

```javascript
// In src/services/api.ts, add:
api.interceptors.request.use(config => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.log('API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);
```

### Use React Native Debugger

1. Install React Native Debugger
2. Enable Network Inspector
3. See all API calls in real-time

### Test Backend Endpoints

Use the React Native app's built-in developer menu:
- Shake device → "Debug" → "Enable Network Inspector"

## Environment-Specific Configuration

If you want to switch between development and production backends:

```typescript
// src/config/api.config.ts
const isDevelopment = __DEV__;

export const API_CONFIG = {
  BASE_URL: isDevelopment 
    ? 'http://10.0.2.2:3000/api/v1' // Android emulator localhost
    : 'https://hakikisha-backend.onrender.com/api/v1',
  TIMEOUT: 30000,
};
```

**Note:** 
- For Android Emulator use: `http://10.0.2.2:PORT` instead of `localhost`
- For iOS Simulator use: `http://localhost:PORT`
- For physical devices use: Your computer's local IP (e.g., `http://192.168.1.100:PORT`)

## Security Checklist

- ✅ HTTPS enabled on backend (Render provides this automatically)
- ✅ JWT tokens stored securely in AsyncStorage
- ✅ Sensitive data not logged to console
- ✅ Token refresh implemented
- ✅ CORS configured for mobile app origins
- ⚠️ Rate limiting configured on backend (recommended)
- ⚠️ Input validation on all endpoints (recommended)

## Next Steps

1. **Verify CORS Configuration:** Test login from the mobile app
2. **Test All Endpoints:** Use the app to test each feature
3. **Monitor Backend Logs:** Check Render logs for any errors
4. **Handle Edge Cases:** Test offline scenarios, slow networks
5. **Add Error Tracking:** Consider Sentry or similar for production

## Backend Health Check

Your backend should have a health endpoint to verify it's running:

```
GET https://hakikisha-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## Support

If you encounter issues:
1. Check backend logs on Render
2. Check React Native debugger console
3. Verify CORS configuration
4. Test endpoints with Postman
5. Check this documentation: `BACKEND_API_DOCUMENTATION.md`
