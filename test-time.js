// Simple time test
const now = Date.now();
console.log('Current timestamp:', now);
console.log('Current date:', new Date(now).toISOString());

// Test 7 days ago
const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
console.log('7 days ago timestamp:', sevenDaysAgo);
console.log('7 days ago date:', new Date(sevenDaysAgo).toISOString());

// Test what date that would be
const date7DaysAgo = new Date(sevenDaysAgo);
console.log('7 days ago as Date object:', date7DaysAgo.toString());
console.log('7 days ago local time:', date7DaysAgo.toLocaleString());

// Check if this matches August 9th
console.log('Is this August 9th?', date7DaysAgo.getDate() === 9 && date7DaysAgo.getMonth() === 7);

