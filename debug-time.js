// Debug script to test time conversion
console.log('=== Time Debug ===');

// Test current time
const now = Date.now();
console.log('Current time (Date.now()):', now);
console.log('Current time as Date:', new Date(now));
console.log('Current time ISO:', new Date(now).toISOString());

// Test parseRelativeTime function
function parseRelativeTime(timeString) {
  // Handle special cases
  if (timeString === 'now') {
    return Date.now();
  }
  
  // Parse ISO date strings
  if (timeString.includes('T') || timeString.includes('-')) {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
  }
  
  // Parse relative time strings like "5m", "2h", "3d", "1w", etc.
  const match = timeString.match(/^(\d+)([mhdw])$/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'm': // minutes
        return Date.now() - value * 60 * 1000;
      case 'h': // hours
        return Date.now() - value * 60 * 60 * 1000;
      case 'd': // days
        return Date.now() - value * 24 * 60 * 60 * 1000;
      case 'w': // weeks
        return Date.now() - value * 7 * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Invalid time unit: ${unit}`);
    }
  }
  
  // If it's a number, assume it's already milliseconds
  const numValue = parseInt(timeString);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  throw new Error(`Invalid time value: ${timeString}. Supported formats: "5m", "2h", "3d", "1w", ISO date, or milliseconds`);
}

// Test different time formats
console.log('\n=== Testing parseRelativeTime ===');

const testCases = [
  'now',
  '1h',
  '24h',
  '7d',
  '1w'
];

testCases.forEach(test => {
  try {
    const result = parseRelativeTime(test);
    console.log(`${test}: ${result} -> ${new Date(result).toISOString()}`);
  } catch (error) {
    console.log(`${test}: ERROR - ${error.message}`);
  }
});

// Test specific dates
console.log('\n=== Testing specific dates ===');
const today = new Date();
const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
console.log('Today:', today.toISOString());
console.log('7 days ago:', sevenDaysAgo.toISOString());
console.log('7 days ago timestamp:', sevenDaysAgo.getTime());

// Test what happens when we use "7d"
const sevenDaysAgoRelative = parseRelativeTime('7d');
console.log('7d relative:', sevenDaysAgoRelative);
console.log('7d relative as date:', new Date(sevenDaysAgoRelative).toISOString());

// Check if there's a difference
const diff = Math.abs(sevenDaysAgo.getTime() - sevenDaysAgoRelative);
console.log('Difference in milliseconds:', diff);
console.log('Difference in hours:', diff / (60 * 60 * 1000));
console.log('Difference in days:', diff / (24 * 60 * 60 * 1000));

