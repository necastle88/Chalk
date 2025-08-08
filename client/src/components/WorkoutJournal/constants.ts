export const JOURNAL_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "CHEST", label: "Chest" },
  { value: "BACK", label: "Back" },
  { value: "LEGS", label: "Legs" },
  { value: "ARMS", label: "Arms" },
  { value: "SHOULDERS", label: "Shoulders" },
  { value: "CORE", label: "Core" },
  { value: "CARDIO", label: "Cardio" },
  { value: "FULLBODY", label: "Full Body" },
  { value: "OTHER", label: "Other" },
];

export const JOURNAL_DATE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 3 months" },
  { value: "180", label: "Last 6 months" },
  { value: "365", label: "Last year" },
  { value: "all", label: "All time" },
];

export const EXERCISE_TYPE_OPTIONS = [
  { value: "all", label: "All Exercises" },
  { value: "strength", label: "Strength Training" },
  { value: "cardio", label: "Cardio" },
];

export const WEIGHT_UNITS = [
  { value: "lbs", label: "lbs" },
  { value: "kg", label: "kg" },
];

export const PERCEIVED_EFFORT_SCALE = [
  { value: 1, label: "1 - Very Easy" },
  { value: 2, label: "2 - Easy" },
  { value: 3, label: "3 - Moderate" },
  { value: 4, label: "4 - Somewhat Hard" },
  { value: 5, label: "5 - Hard" },
  { value: 6, label: "6" },
  { value: 7, label: "7 - Very Hard" },
  { value: 8, label: "8" },
  { value: 9, label: "9 - Near Maximal" },
  { value: 10, label: "10 - Maximal" },
];

export const DEFAULT_JOURNAL_LIMIT = 20;
export const DEFAULT_JOURNAL_DATE_FILTER = "30";
