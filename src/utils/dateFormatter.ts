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
 * Format ISO date string to readable date and time
 * @param dateString - ISO date string from backend
 * @returns Formatted date like "Jan 15, 2024 at 2:30 PM"
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  } catch (error) {
    return '';
  }
};

/**
 * Format ISO date string to relative time
 * @param dateString - ISO date string from backend
 * @returns Relative time like "2 hours ago" or "3 days ago"
 */
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
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
