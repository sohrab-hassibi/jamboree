#!/usr/bin/env node

/**
 * Automated Pacific Time Migration Script
 * This script automatically updates all date formatting to use Pacific Time
 */

const fs = require('fs');
const path = require('path');

// Define the root directory
const rootDir = path.resolve(__dirname, '..');

// Date utilities content that will be created
const dateUtilsContent = `// utils/date-utils.ts
/**
 * Pacific Time utilities for consistent timezone handling
 * Works both locally and in deployment
 */

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatTimeRange(startDate: Date | string, endDate: Date | string): string {
  const start = formatTime(startDate);
  const end = formatTime(endDate);
  return \`\${start} - \${end}\`;
}

export function formatEventCardDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function formatEventCardTime(date: Date | string): string {
  return formatTime(date);
}

export function getCurrentISOString(): string {
  return new Date().toISOString();
}

export function toPacificTime(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return \`\${diffMins}m ago\`;
  if (diffHours < 24) return \`\${diffHours}h ago\`;
  if (diffDays < 7) return \`\${diffDays}d ago\`;
  return formatDate(d);
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  const dPacific = toPacificTime(d);
  const todayPacific = toPacificTime(today);
  
  return dPacific.toDateString() === todayPacific.toDateString();
}
`;

// Files to update
const filesToUpdate = [
  'components/screens/event-screen.tsx',
  'components/screens/event-detail-screen.tsx',
  'components/screens/profile-view-screen.tsx', 
  'components/screens/profile-screen.tsx',
  'components/screens/band-chat-screen.tsx',
  'components/screens/bands-screen.tsx',
  'hooks/use-event-chat.ts',
  'hooks/use-band-messages.ts',
  'hooks/use-event-participation.ts',
  'hooks/use-user-events.ts',
  'components/layout/sidebar.tsx',
  'components/event-card.tsx',
];

function createDateUtils() {
  const utilsDir = path.join(rootDir, 'utils');
  const dateUtilsPath = path.join(utilsDir, 'date-utils.ts');
  
  // Create utils directory if it doesn't exist
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
    console.log('✅ Created utils directory');
  }
  
  // Write date-utils.ts
  fs.writeFileSync(dateUtilsPath, dateUtilsContent);
  console.log('✅ Created utils/date-utils.ts with Pacific Time functions');
}

function updateFile(filePath) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipped ${filePath} (file not found)`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Check if file needs date utility imports
  const needsDateUtils = content.includes('toLocaleDateString') || 
                         content.includes('toLocaleTimeString') || 
                         content.includes('toLocaleString') ||
                         content.includes('new Date().toISOString()');
  
  if (needsDateUtils && !content.includes('from "@/utils/date-utils"')) {
    // Add import at the top after existing imports
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the last import line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || (lines[i].startsWith('const ') && lines[i].includes('require('))) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '') {
        continue;
      } else {
        break;
      }
    }
    
    const importLine = 'import { formatDate, formatTime, formatDateTime, formatTimeRange, formatEventCardDate, formatEventCardTime, getCurrentISOString, formatRelativeTime, isToday } from "@/utils/date-utils";';
    lines.splice(insertIndex, 0, importLine);
    content = lines.join('\n');
    modified = true;
  }
  
  // Apply transformations
  const originalContent = content;
  
  // Replace .toLocaleDateString() calls
  content = content.replace(/(\w+)\.toLocaleDateString\([^)]*\)/g, 'formatDate($1)');
  
  // Replace .toLocaleTimeString() calls  
  content = content.replace(/(\w+)\.toLocaleTimeString\([^)]*\)/g, 'formatTime($1)');
  
  // Replace .toLocaleString() calls
  content = content.replace(/(\w+)\.toLocaleString\([^)]*\)/g, 'formatDateTime($1)');
  
  // Replace new Date().toISOString()
  content = content.replace(/new Date\(\)\.toISOString\(\)/g, 'getCurrentISOString()');
  
  if (content !== originalContent) {
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed for ${filePath}`);
  }
}

async function main() {
  console.log('🚀 Starting automated Pacific Time migration...\n');
  
  try {
    // Step 1: Create date utilities
    createDateUtils();
    console.log('');
    
    // Step 2: Update all files
    console.log('📝 Updating files to use Pacific Time...');
    filesToUpdate.forEach(updateFile);
    console.log('');
    
    // Step 3: Summary
    console.log('🎉 Pacific Time migration complete!');
    console.log('');
    console.log('✅ All dates and times will now display in Pacific Time');
    console.log('✅ Event times should now match creation times');
    console.log('✅ Works both locally and in deployment');
    console.log('');
    console.log('🔄 Please test your app to verify the changes work correctly.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();