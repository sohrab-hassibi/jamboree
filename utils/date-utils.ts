/**
 * Date utility functions for the Jamboree app
 * All dates and times are displayed in Pacific Time (PT)
 */

// Pacific Time Zone identifier
const PACIFIC_TIMEZONE = 'America/Los_Angeles';

/**
 * Format a date string to display the date in Pacific Time
 * @param dateString ISO date string
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string in Pacific Time
 */
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = new Date(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: PACIFIC_TIMEZONE,
    ...options
  };
  
  return date.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date string to display the time in Pacific Time
 * @param dateString ISO date string
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted time string in Pacific Time
 */
export function formatTime(dateString: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = new Date(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: PACIFIC_TIMEZONE,
    ...options
  };
  
  return date.toLocaleTimeString('en-US', defaultOptions);
}

/**
 * Format a date string to display both date and time in Pacific Time
 * @param dateString ISO date string
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date and time string in Pacific Time
 */
export function formatDateTime(dateString: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = new Date(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: PACIFIC_TIMEZONE,
    ...options
  };
  
  return date.toLocaleString('en-US', defaultOptions);
}

/**
 * Format a time range (start and end times) in Pacific Time
 * @param startTimeString ISO date string for start time
 * @param endTimeString ISO date string for end time
 * @returns Formatted time range string in Pacific Time
 */
export function formatTimeRange(startTimeString: string, endTimeString: string) {
  return `${formatTime(startTimeString)} - ${formatTime(endTimeString)} PT`;
}

/**
 * Format a date for event cards (compact format) in Pacific Time
 * @param dateString ISO date string
 * @returns Formatted date string in Pacific Time
 */
export function formatEventCardDate(dateString: string) {
  return formatDate(dateString, {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric'
  });
}

/**
 * Format a date for message timestamps in Pacific Time
 * @param dateString ISO date string
 * @returns Formatted time string in Pacific Time
 */
export function formatMessageTime(dateString: string) {
  return formatTime(dateString, {
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Create a new Date object with the current time in ISO format
 * This is useful for creating timestamps that will be stored in the database
 * @returns ISO string of current time
 */
export function getCurrentISOString() {
  return new Date().toISOString();
}

/**
 * Check if a date is in the past
 * @param dateString ISO date string
 * @returns boolean indicating if the date is in the past
 */
export function isPastDate(dateString: string) {
  return new Date(dateString) < new Date();
}

/**
 * Check if a date is in the future
 * @param dateString ISO date string
 * @returns boolean indicating if the date is in the future
 */
export function isFutureDate(dateString: string) {
  return new Date(dateString) > new Date();
}

/**
 * Check if two dates are on the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns boolean indicating if the dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date) {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "3 days ago")
 * This is a simplified replacement for date-fns formatDistanceToNow
 * @param dateString ISO date string
 * @param addSuffix Whether to add a suffix (ago/from now)
 * @returns Formatted relative time string
 */
export function formatRelativeTime(dateString: string, addSuffix = true) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Define time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  let result = '';
  
  if (diffInSeconds < minute) {
    result = 'just now';
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    result = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    result = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    result = `${days} ${days === 1 ? 'day' : 'days'}`;
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    result = `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    result = `${months} ${months === 1 ? 'month' : 'months'}`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    result = `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  
  return addSuffix ? `${result} ago` : result;
}
