// Simple test to verify pagination logic
const groupEntriesByDate = (entries) => {
  return entries.reduce((groups, entry) => {
    const dateKey = entry.date;
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
    return groups;
  }, {});
};

const getSessionCount = (entries) => {
  const groupedByDate = groupEntriesByDate(entries);
  return Object.keys(groupedByDate).length;
};

// Test data with different dates to simulate session cards
const testEntries = [
  { id: "1", date: "2025-08-01", exerciseName: "Push ups" },
  { id: "2", date: "2025-08-01", exerciseName: "Sit ups" },
  { id: "3", date: "2025-08-02", exerciseName: "Running" },
  { id: "4", date: "2025-08-03", exerciseName: "Squats" },
  { id: "5", date: "2025-08-04", exerciseName: "Bench press" },
  { id: "6", date: "2025-08-05", exerciseName: "Cycling" },
  { id: "7", date: "2025-08-06", exerciseName: "Swimming" },
  { id: "8", date: "2025-08-07", exerciseName: "Deadlifts" },
  { id: "9", date: "2025-08-08", exerciseName: "Pull ups" },
];

const sessionCount = getSessionCount(testEntries);
console.log(`Session count: ${sessionCount}`);
console.log(`Should show pagination: ${sessionCount > 7}`);

// Test with fewer sessions
const fewerEntries = testEntries.slice(0, 6);
const fewerSessionCount = getSessionCount(fewerEntries);
console.log(`Fewer session count: ${fewerSessionCount}`);
console.log(`Should show pagination: ${fewerSessionCount > 7}`);
