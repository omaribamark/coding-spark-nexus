/**
 * Utility functions for formatting dates and times
 */

/**
 * Format ISO date string to readable date
 * @param dateString - ISO date string from backend
 * @returns Formatted date like "Jan 15, 2024"
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return '';
  }
};

/**
 * Format ISO date string to readable date and time with correct timezone (East Africa Time UTC+3)
 * @param dateString - ISO date string from backend
 * @returns Formatted date like "Jan 15, 2024 at 2:30 PM EAT"
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Parse the date string - handle both ISO strings and timestamps
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format in East Africa Time (UTC+3)
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Nairobi' // East Africa Time (Kenya)
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formatted = formatter.format(date);
    
    return `${formatted} EAT`;
  } catch (error) {
    return '';
  }
};

/**
 * Format ISO date string to time only with correct timezone (East Africa Time UTC+3)
 * @param dateString - ISO date string from backend
 * @returns Formatted time like "7:30 PM EAT"
 */
export const formatTimeOnly = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Parse the date string
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Time';
    
    // Format in East Africa Time (UTC+3) - time only
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Nairobi' // East Africa Time (Kenya)
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formatted = formatter.format(date);
    
    return `${formatted} EAT`;
  } catch (error) {
    return '';
  }
};

/**
 * Format ISO date string to relative time (with correct timezone handling)
 * @param dateString - ISO date string from backend
 * @returns Relative time like "2 hours ago" or "3 days ago"
 */
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Parse date and ensure validity
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    // Compare absolute timestamps (timezone-agnostic)
    const nowMs = Date.now();
    const diffInMs = nowMs - date.getTime();

    // Guard: future dates
    if (diffInMs < 0) return 'just now';

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    return '';
  }
};
