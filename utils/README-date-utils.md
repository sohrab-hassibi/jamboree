# Date Utility Functions for Jamboree

This directory contains utility functions for formatting dates and times consistently in Pacific Time (PT) throughout the Jamboree app.

## Overview

All date and time displays in the Jamboree app should use Pacific Time. The `date-utils.ts` file provides standardized functions to ensure consistent formatting across the application.

## Available Functions

### Basic Formatting

- `formatDate(dateString, options)` - Format a date in Pacific Time
- `formatTime(dateString, options)` - Format a time in Pacific Time
- `formatDateTime(dateString, options)` - Format both date and time in Pacific Time
- `formatTimeRange(startTimeString, endTimeString)` - Format a time range in Pacific Time

### Specialized Formatting

- `formatEventCardDate(dateString)` - Format a date for event cards in Pacific Time
- `formatMessageTime(dateString)` - Format a time for message timestamps in Pacific Time
- `getCurrentISOString()` - Get current time as ISO string (for database storage)

### Helper Functions

- `isPastDate(dateString)` - Check if a date is in the past
- `isFutureDate(dateString)` - Check if a date is in the future
- `isSameDay(date1, date2)` - Check if two dates are on the same day

## Usage Examples

```typescript
import { 
  formatDate, 
  formatTime, 
  formatTimeRange, 
  formatEventCardDate,
  getCurrentISOString 
} from "@/utils/date-utils";

// Format a date in Pacific Time
const formattedDate = formatDate(event.start_time);
// Result: "Mon, May 28"

// Format a time in Pacific Time
const formattedTime = formatTime(event.start_time);
// Result: "7:30 PM"

// Format a time range in Pacific Time
const timeRange = formatTimeRange(event.start_time, event.end_time);
// Result: "7:30 PM - 9:30 PM PT"

// Format a date for event cards
const eventDate = formatEventCardDate(event.start_time);
// Result: "Mon, 5/28"

// Get current time for database storage
const now = getCurrentISOString();
// Result: "2025-05-28T19:18:11.000Z"
```

## Implementation Guide

To ensure all dates and times are displayed in Pacific Time:

1. Import the necessary functions at the top of your component:
   ```typescript
   import { formatDate, formatTime, formatTimeRange } from "@/utils/date-utils";
   ```

2. Replace direct Date manipulations with the utility functions:

   **Before:**
   ```typescript
   const date = new Date(event.start_time);
   return date.toLocaleDateString("en-US", {
     weekday: "short",
     month: "short",
     day: "numeric",
   });
   ```

   **After:**
   ```typescript
   return formatDate(event.start_time);
   ```

3. For database timestamps, use `getCurrentISOString()` instead of `new Date().toISOString()`.

## Why Pacific Time?

Using Pacific Time (PT) throughout the app ensures consistency for all users, regardless of their local timezone. This is especially important for event coordination and chat timestamps.
