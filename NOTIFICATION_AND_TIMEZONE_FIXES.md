# Notification Badge & Timezone Fixes

## Overview
This document outlines the fixes applied to:
1. Correct timezone display in Fact Checker screens (Nairobi/EAT timezone)
2. Enable notification badges for unread verdicts on Claims tab icon
3. Ensure verdict responses are visible to fact checkers and admins

## Changes Made

### 1. Timezone Fixes in Fact Checker Dashboard

**Problem:** 
- Fact checker screens were using local date formatting functions that didn't respect the correct timezone
- Times were displaying incorrectly for users in Nairobi (EAT - East Africa Time, UTC+3)

**Solution:**
- Updated `src/screens/FactCheckerDashboardScreen.tsx` to import and use the centralized date formatting utilities from `src/utils/dateFormatter.ts`
- These utilities use `Intl.DateTimeFormat` with `timeZone: 'Africa/Nairobi'` to ensure correct EAT display
- Formats used:
  - `formatDateTime()` - Full date and time with EAT suffix (e.g., "Jan 9, 2025 at 5:30 PM EAT")
  - `formatRelativeTime()` - Relative time with proper timezone handling (e.g., "2 hours ago")

**Files Modified:**
- `src/screens/FactCheckerDashboardScreen.tsx`
- Removed local date formatting functions
- Added import: `import { formatDateTime, formatRelativeTime } from '../utils/dateFormatter';`

### 2. Notification Badge for Unread Verdicts

**Problem:**
- Backend was correctly returning unread verdict count (confirmed in logs showing 3 unread verdicts)
- Frontend was fetching the data but badge wasn't displaying properly

**Solution:**

#### Frontend Changes:
1. **Enhanced Logging** (`src/components/NotificationBadge.tsx`):
   - Added console logs to track badge rendering
   - Logs when badge is hidden vs showing
   - Helps debug visibility issues

2. **Improved State Management** (`src/screens/HomeScreen.tsx`):
   - Added detailed logging for unread verdict fetching
   - Enhanced error handling to not reset count on fetch errors
   - Added logging for polling interval

3. **Better API Response Handling** (`src/services/claimsService.ts`):
   - Added detailed logging of API responses
   - Logs the full response structure for debugging
   - Ensures `unreadCount` is properly extracted

#### Backend Changes:
1. **Enhanced Controller** (`src/controllers/notificationController.js`):
   - Added logging for unread verdict count requests
   - Logs the count being returned
   - Fixed timezone handling in `markVerdictAsRead` to use Nairobi timezone
   - Changed `db.fn.now()` to `db.raw("NOW() AT TIME ZONE 'Africa/Nairobi'")`

2. **Created Notification Service** (`src/services/notificationService.ts`):
   - New dedicated service for notification-related operations
   - Methods:
     - `getUnreadVerdictsCount()` - Get count of unread verdicts
     - `getUnreadVerdicts()` - Get full list of unread verdict notifications
     - `markVerdictAsRead(claimId)` - Mark a specific verdict as read

**How It Works:**
1. `HomeScreen` fetches unread verdict count on mount and every 30 seconds
2. Count is passed to `NotificationBadge` component
3. Badge displays red circle with count if count > 0
4. When user views a claim detail, verdict is marked as read
5. Count updates on next fetch

### 3. Verdict Responses Visibility for Fact Checkers/Admins

**Status:** ✅ Already Working

**Implementation:**
- `ClaimDetailsScreen` (lines 598-620) fetches and displays all verdict responses without role restrictions
- Both users and fact checkers can see responses
- Response display includes:
  - User's full name or username
  - Response text
  - Creation date
- No code changes needed - feature already working as intended

**How It Works:**
1. When claim details page loads, it fetches verdict responses via `verdictResponseService.getClaimResponses(claimId)`
2. Responses are displayed in a "USER RESPONSES" section
3. No role-based filtering - all responses visible to everyone viewing the claim
4. Fact checkers and admins can see user feedback on their verdicts

## Testing Instructions

### Test Timezone Display
1. Log in as a fact checker
2. Navigate to Fact Checker Dashboard
3. Check "Pending Claims" tab - times should show in EAT (e.g., "5:30 PM EAT")
4. Check "AI Suggestions" tab - analyzed times should show in EAT
5. Verify all timestamps are correct for Nairobi timezone (UTC+3)

### Test Notification Badge
1. Log in as a regular user
2. Submit a claim
3. Have a fact checker verify the claim (add verdict)
4. Log back in as the user
5. Check the Claims tab icon - should show a red badge with count
6. Click to view claim details
7. Badge count should decrease after viewing
8. Check console logs for debugging info:
   ```
   🏠 HomeScreen mounted - fetching unread verdicts
   🔔 Unread verdicts API response: {...}
   📱 Unread verdict count fetched: 3
   🔴 NotificationBadge render - count: 3
   🔴 Badge showing - displayCount: 3
   ```

### Test Verdict Response Visibility
1. As a user, submit a claim
2. As a fact checker, verify the claim with a verdict
3. As the same user, view the claim and add a response to the verdict
4. As the fact checker, navigate back to the same claim
5. Verify you can see the user's response in the "USER RESPONSES" section
6. As an admin, verify you can also see the responses

## API Endpoints

### Get Unread Verdict Count
```
GET /api/v1/notifications/unread-verdicts
Authorization: Bearer <token>

Response:
{
  "success": true,
  "unreadCount": 3
}
```

### Mark Verdict as Read
```
POST /api/v1/notifications/verdicts/:claimId/read
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Verdict marked as read"
}
```

## Troubleshooting

### Badge Not Showing
1. Check console logs for badge render count
2. Verify API is returning `unreadCount` field
3. Check that `verdict_read_at` is NULL for unread verdicts in database
4. Ensure HomeScreen is fetching count on mount

### Wrong Timezone in Fact Checker
1. Verify `src/utils/dateFormatter.ts` is using `timeZone: 'Africa/Nairobi'`
2. Check that FactCheckerDashboardScreen is importing from dateFormatter utils
3. Ensure dates are coming from backend as ISO strings

### Responses Not Visible
1. Check that claim has verdict (required to show response section)
2. Verify API endpoint `/claims/:claimId/verdict-responses` is working
3. Check console for any errors fetching responses
4. Ensure user is authenticated

## Files Modified

### Frontend
- `src/screens/FactCheckerDashboardScreen.tsx` - Fixed timezone display
- `src/screens/HomeScreen.tsx` - Enhanced notification badge fetching
- `src/components/NotificationBadge.tsx` - Added logging
- `src/services/claimsService.ts` - Enhanced API response logging
- `src/services/notificationService.ts` - **NEW** Dedicated notification service

### Backend
- `src/controllers/notificationController.js` - Enhanced logging and timezone handling

## Future Enhancements

1. **Real-time Updates**: Consider using WebSockets or Server-Sent Events for instant notification updates
2. **Push Notifications**: Add mobile push notifications for new verdicts
3. **Notification Center**: Create a dedicated notifications screen showing all past notifications
4. **Batch Mark as Read**: Allow marking multiple verdicts as read at once
5. **Notification Preferences**: Let users configure notification settings
